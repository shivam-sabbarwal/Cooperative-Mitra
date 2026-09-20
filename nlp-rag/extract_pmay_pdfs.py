from pathlib import Path
import json
from pypdf import PdfReader


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PDFS = [
    {
        "pdf": (
            BASE_DIR
            / "docs"
            / "knowledge_base"
            / "government"
            / "housing"
            / "pmay_u_2.0"
            / "pmay_u_2_guidelines_en.pdf"
        ),
        "json": (
            BASE_DIR
            / "nlp-rag"
            / "knowledge_base"
            / "raw"
            / "official"
            / "official_pmay_u_2.json"
        ),
        "doc_id": "OFFICIAL_PMAY_U_2_2024",
        "title": "Pradhan Mantri Awas Yojana – Urban 2.0 Scheme Guidelines",
        "citation": (
            "Ministry of Housing and Urban Affairs, Government of India, "
            "PMAY-U 2.0 Scheme Guidelines"
        ),
        "url": "https://www.pmay-urban.gov.in/guideline",
    },
    {
        "pdf": (
            BASE_DIR
            / "docs"
            / "knowledge_base"
            / "government"
            / "housing"
            / "pmay_g"
            / "pmay_g_overview_en.pdf"
        ),
        "json": (
            BASE_DIR
            / "nlp-rag"
            / "knowledge_base"
            / "raw"
            / "official"
            / "official_pmay_g.json"
        ),
        "doc_id": "OFFICIAL_PMAY_G_OVERVIEW",
        "title": "Pradhan Mantri Awaas Yojana – Gramin Overview",
        "citation": (
            "Department of Rural Development, Ministry of Rural Development, "
            "Government of India, PMAY-G Overview"
        ),
        "url": "https://www.dord.gov.in/",
    },
]


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_pdf_text(pdf_path: Path) -> tuple[str, int]:
    print(f"\nReading PDF:")
    print(pdf_path)

    reader = PdfReader(str(pdf_path))

    pages = []
    successful_pages = 0

    for page_number, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""

            if text.strip():
                pages.append(
                    f"\n\n--- Page {page_number} ---\n\n{text.strip()}"
                )
                successful_pages += 1

        except Exception as exc:
            print(
                f"WARNING: Could not extract page "
                f"{page_number}: {exc}"
            )

    return "".join(pages), successful_pages


# ============================================================
# JSON CREATION
# ============================================================

def create_document(config: dict) -> None:
    pdf_path = config["pdf"]
    json_path = config["json"]

    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}")
        return

    text, page_count = extract_pdf_text(pdf_path)

    if not text.strip():
        print(f"ERROR: No text extracted from {pdf_path}")
        return

    document = [
        {
            "doc_id": config["doc_id"],
            "title": config["title"],
            "category": "SCHEME",
            "source_type": "OFFICIAL",
            "source_citation": config["citation"],
            "official_url": config["url"],
            "language": "en",
            "content": text,
        }
    ]

    json_path.parent.mkdir(parents=True, exist_ok=True)

    with open(
        json_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            document,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print("\nEXTRACTION SUCCESSFUL")
    print(f"Pages with text: {page_count}")
    print(f"Characters extracted: {len(text):,}")
    print(f"JSON: {json_path}")


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 60)
    print("COOPERATIVE MITRA - PMAY PDF EXTRACTION")
    print("=" * 60)

    for config in PDFS:
        create_document(config)

    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()