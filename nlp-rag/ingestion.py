import os
import sys
import json
import chromadb
from pathlib import Path
from sentence_transformers import SentenceTransformer

# Configure UTF-8 for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

RAW_DIR = BASE_DIR / "knowledge_base" / "raw"
OFFICIAL_DIR = RAW_DIR / "official"
PLACEHOLDER_DIR = RAW_DIR / "placeholder"

PROCESSED_DIR = BASE_DIR / "knowledge_base" / "processed"
CHROMA_DIR = BASE_DIR / "knowledge_base" / "chroma_db"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# MULTILINGUAL EMBEDDING MODEL
# ============================================================

EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

print(f"Using multilingual embedding model: {EMBEDDING_MODEL}")

embedding_model = SentenceTransformer(EMBEDDING_MODEL)


# ============================================================
# TEXT CHUNKING
# ============================================================

def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100
) -> list[str]:
    """Split text into overlapping chunks."""

    text = text.strip()

    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end]

        if chunk.strip():
            chunks.append(chunk.strip())

        start += chunk_size - overlap

        if end >= len(text):
            break

    return chunks


# ============================================================
# LOAD DOCUMENTS
# ============================================================

def load_documents_from_dir(
    directory: Path,
    default_source_type: str
) -> list[dict]:

    docs = []

    if not directory.exists():
        return docs

    # Keep the raw collection organised by subject.  ``rglob`` also keeps
    # compatibility with the original flat ``raw/official`` layout.
    for file_path in directory.rglob("*.json"):

        try:
            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as f:

                data = json.load(f)

                if isinstance(data, list):

                    for item in data:

                        docs.append(
                            normalize_document(item, default_source_type)
                        )

                elif isinstance(data, dict):

                    docs.append(
                        normalize_document(data, default_source_type)
                    )

        except Exception as e:

            print(
                f"Error reading {file_path}: {e}"
            )

    return docs


def normalize_document(
    document: dict,
    default_source_type: str,
) -> dict:
    """Apply the PRD metadata contract without changing the RAG pipeline.

    Older records remain usable; missing fields receive conservative values.
    A record is never upgraded from a placeholder to an official source here.
    """

    doc = dict(document)
    source_type = str(doc.get("source_type", default_source_type)).upper()
    doc["source_type"] = source_type
    doc.setdefault(
        "source_status",
        "PLACEHOLDER" if source_type == "PLACEHOLDER" else "OFFICIAL",
    )
    doc.setdefault("document_type", "GUIDELINE")
    doc.setdefault("state", "National")
    doc.setdefault("scheme", doc.get("scheme_name", ""))
    doc.setdefault("ministry", "")
    doc.setdefault("publication_date", "")
    doc.setdefault("effective_date", "")
    doc.setdefault("superseded_date", "")
    doc.setdefault("version", "")
    doc.setdefault("status", "ACTIVE")
    doc.setdefault("act", "")
    doc.setdefault("section", "")
    doc.setdefault("page", "")
    return doc


# ============================================================
# MAIN INGESTION
# ============================================================

def ingest_knowledge_base():

    print("\n========================================")
    print("Cooperative Mitra Knowledge Base")
    print("Multilingual RAG Ingestion")
    print("========================================\n")


    # --------------------------------------------------------
    # 1. LOAD DOCUMENTS
    # --------------------------------------------------------

    print("Loading knowledge documents...")

    official_docs = load_documents_from_dir(
        OFFICIAL_DIR,
        "OFFICIAL"
    )

    placeholder_docs = load_documents_from_dir(
        PLACEHOLDER_DIR,
        "PLACEHOLDER"
    )

    all_raw_docs = official_docs + placeholder_docs

    print(
        f"Loaded {len(official_docs)} official documents "
        f"and {len(placeholder_docs)} placeholder documents."
    )


    # --------------------------------------------------------
    # 2. CREATE CHUNKS
    # --------------------------------------------------------

    print("\nCreating document chunks...")

    chunks = []

    for doc in all_raw_docs:

        doc_id = doc.get(
            "doc_id",
            "UNKNOWN_ID"
        )

        title = doc.get(
            "title",
            "Untitled Document"
        )

        category = doc.get(
            "category",
            "GENERAL"
        )

        source_type = doc.get(
            "source_type",
            "OFFICIAL"
        )

        source_citation = doc.get(
            "source_citation",
            "Cooperative Knowledge Base"
        )

        official_url = doc.get(
            "official_url"
        ) or ""

        language = doc.get(
            "language",
            "en"
        )

        content = doc.get(
            "content",
            ""
        )

        text_chunks = chunk_text(content)

        for idx, text_chunk in enumerate(text_chunks):

            chunk_id = f"{doc_id}_chunk_{idx}"

            metadata = {

                "doc_id": doc_id,
                "title": title,
                "category": category,
                "source_type": source_type,
                "source_status": doc.get("source_status", "OFFICIAL"),
                "source_citation": source_citation,
                "official_url": official_url,
                "language": language,
                "state": doc.get("state", "National"),
                "scheme": doc.get("scheme", ""),
                "document_type": doc.get("document_type", "GUIDELINE"),
                "ministry": doc.get("ministry", ""),
                "publication_date": doc.get("publication_date", ""),
                "effective_date": doc.get("effective_date", ""),
                "superseded_date": doc.get("superseded_date", ""),
                "version": doc.get("version", ""),
                "status": doc.get("status", "ACTIVE"),
                "act": doc.get("act", ""),
                "section": doc.get("section", ""),
                "page": doc.get("page", ""),
                "chunk_index": idx,
            }

            chunks.append({

                "id": chunk_id,

                "text": text_chunk,

                "metadata": metadata

            })

    print(
        f"Created {len(chunks)} text chunks."
    )


    if not chunks:

        print(
            "\nERROR: No documents were found."
        )

        return


    # --------------------------------------------------------
    # 3. SAVE PROCESSED CHUNKS
    # --------------------------------------------------------

    processed_file = (
        PROCESSED_DIR / "chunks.json"
    )

    with open(
        processed_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            chunks,
            f,
            indent=2,
            ensure_ascii=False
        )

    print(
        f"Saved processed chunks to:\n"
        f"{processed_file}"
    )


    # --------------------------------------------------------
    # 4. CONNECT TO CHROMADB
    # --------------------------------------------------------

    print("\nConnecting to ChromaDB...")

    client = chromadb.PersistentClient(
        path=str(CHROMA_DIR)
    )

    collection_name = "cooperative_knowledge"


    # --------------------------------------------------------
    # 5. DELETE OLD COLLECTION
    # --------------------------------------------------------

    print(
        "Removing previous knowledge collection..."
    )

    try:

        client.delete_collection(
            collection_name
        )

        print("Old collection deleted.")

    except Exception:

        print(
            "No previous collection found."
        )


    # --------------------------------------------------------
    # 6. CREATE NEW COLLECTION
    # --------------------------------------------------------

    collection = client.create_collection(

        name=collection_name,

        metadata={
            "hnsw:space": "cosine"
        }

    )

    print(
        f"Created collection: {collection_name}"
    )


    # --------------------------------------------------------
    # 7. PREPARE DOCUMENT DATA
    # --------------------------------------------------------

    ids = [
        c["id"]
        for c in chunks
    ]

    documents = [
        c["text"]
        for c in chunks
    ]

    metadatas = [
        c["metadata"]
        for c in chunks
    ]


    # --------------------------------------------------------
    # 8. GENERATE MULTILINGUAL EMBEDDINGS
    # --------------------------------------------------------

    print("\nGenerating multilingual embeddings...")

    print(
        f"Embedding {len(documents)} chunks..."
    )

    embeddings = embedding_model.encode(

        documents,

        batch_size=32,

        show_progress_bar=True,

        normalize_embeddings=True

    ).tolist()


    print(
        "Embeddings generated successfully."
    )


    # --------------------------------------------------------
    # 9. ADD TO CHROMADB
    # --------------------------------------------------------

    print("\nIndexing documents into ChromaDB...")

    # Chroma has limits on very large batches,
    # so index in manageable batches.

    batch_size = 500

    for start in range(
        0,
        len(ids),
        batch_size
    ):

        end = min(
            start + batch_size,
            len(ids)
        )

        collection.add(

            ids=ids[start:end],

            documents=documents[start:end],

            metadatas=metadatas[start:end],

            embeddings=embeddings[start:end]

        )

        print(
            f"Indexed {end}/{len(ids)} chunks..."
        )


    print(
        f"\nSuccessfully indexed "
        f"{len(ids)} chunks into ChromaDB."
    )


    # --------------------------------------------------------
    # 10. MULTILINGUAL VERIFICATION
    # --------------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "Multilingual Retrieval Verification"
    )

    print(
        "========================================\n"
    )


    test_queries = [

        (
            "How can PACS diversify their business activities?",
            "en"
        ),

        (
            "पैक्स का कंप्यूटरीकरण कैसे किया जा रहा है?",
            "hi"
        ),

        (
            "ಬಹು-ರಾಜ್ಯ ಸಹಕಾರ ಸಂಘಗಳ ಕಾಯ್ದೆ ಎಂದರೇನು?",
            "kn"
        ),

        (
            "पॅक्सच्या व्यवसायात विविधता कशी आणता येते?",
            "mr"
        ),

        (
            "ప్యాక్స్ తమ వ్యాపార కార్యకలాపాలను ఎలా విస్తరించవచ్చు?",
            "te"
        )

    ]


    for query, language in test_queries:

        try:

            query_embedding = embedding_model.encode(

                [query],

                normalize_embeddings=True

            ).tolist()


            results = collection.query(

                query_embeddings=query_embedding,

                n_results=1

            )


            if (
                results.get("ids")
                and len(results["ids"][0]) > 0
            ):

                top_id = results["ids"][0][0]

                top_meta = (
                    results["metadatas"][0][0]
                )

                top_doc = (
                    results["documents"][0][0]
                )

                distance = None

                if results.get("distances"):
                    distance = (
                        results["distances"][0][0]
                    )

                print(
                    f"\n[{language.upper()}]"
                )

                print(
                    f"Query: {query}"
                )

                print(
                    f"Top match: "
                    f"[{top_meta.get('source_type')}] "
                    f"{top_meta.get('title')} "
                    f"({top_id})"
                )

                if distance is not None:
                    print(
                        f"Cosine distance: "
                        f"{distance:.4f}"
                    )

                print(
                    f"Text: {top_doc[:150]}..."
                )

            else:

                print(
                    f"\n[{language.upper()}]"
                )

                print(
                    f"Query: {query}"
                )

                print(
                    "No match found."
                )


        except Exception as e:

            print(
                f"\n[{language.upper()}]"
            )

            print(
                f"Query failed: {e}"
            )


    # --------------------------------------------------------
    # 11. FINAL STATUS
    # --------------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "Knowledge Base Ingestion Complete"
    )

    print(
        "========================================"
    )

    print(
        f"Documents: {len(all_raw_docs)}"
    )

    print(
        f"Chunks: {len(chunks)}"
    )

    print(
        f"Embedding model: {EMBEDDING_MODEL}"
    )

    print(
        "Languages tested: EN / HI / KN / MR / TE"
    )

    print(
        f"ChromaDB: {CHROMA_DIR}"
    )


if __name__ == "__main__":
    ingest_knowledge_base()
