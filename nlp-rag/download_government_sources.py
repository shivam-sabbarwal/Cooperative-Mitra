"""
COOPERATIVE MITRA
Government Knowledge Base Downloader

Purpose:
    Download official government scheme documents into:

    docs/knowledge_base/government/

This script ONLY downloads source material.
It does NOT modify:
    - ChromaDB
    - RAG service
    - embeddings
    - frontend
    - backend

We will ingest the downloaded documents in the next step.
"""

from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import time


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

KNOWLEDGE_BASE = (
    PROJECT_ROOT
    / "docs"
    / "knowledge_base"
    / "government"
)

TIMEOUT = 60


# ============================================================
# OFFICIAL GOVERNMENT DOCUMENTS
# ============================================================

SOURCES = [

    # --------------------------------------------------------
    # PMAY-U 2.0
    # Ministry of Housing and Urban Affairs
    # --------------------------------------------------------

    {
        "id": "PMAY_U_2_GUIDELINES_EN",

        "title": (
            "Pradhan Mantri Awas Yojana "
            "Urban 2.0 Scheme Guidelines"
        ),

        "scheme": "PMAY-U 2.0",

        "category": "housing",

        "ministry": (
            "Ministry of Housing and Urban Affairs"
        ),

        "language": "en",

        "source_status": "OFFICIAL",

        "source_url": (
            "https://www.pmay-urban.gov.in/guideline"
        ),

        "document_url": (
            "https://pmay-urban.gov.in/uploads/guidelines/"
            "Operational-Guidelines-of-PMAY-U-2.pdf"
        ),

        "filename": (
            "pmay_u_2_guidelines_en.pdf"
        ),
    },


    # --------------------------------------------------------
    # PMAY-G
    # Ministry of Rural Development
    # --------------------------------------------------------

    {
        "id": "PMAY_G_OVERVIEW_EN",

        "title": (
            "Pradhan Mantri Awaas Yojana - "
            "Gramin Overview"
        ),

        "scheme": "PMAY-G",

        "category": "housing",

        "ministry": (
            "Ministry of Rural Development"
        ),

        "language": "en",

        "source_status": "OFFICIAL",

        "source_url": (
            "https://pmayg.nic.in/"
        ),

        "document_url": (
            "https://rural.gov.in/sites/default/files/"
    "Overview%20of%20PMAY-G.pdf"
        ),

        "filename": (
            "pmay_g_overview_en.pdf"
        ),
    },
]


# ============================================================
# DIRECTORY CREATION
# ============================================================

def create_directories():
    """
    Create folders for each scheme.
    """

    for source in SOURCES:

        scheme_folder = (
            KNOWLEDGE_BASE
            / source["category"]
            / source["scheme"]
                .lower()
                .replace(" ", "_")
                .replace("-", "_")
        )

        scheme_folder.mkdir(
            parents=True,
            exist_ok=True
        )


# ============================================================
# DOWNLOAD
# ============================================================

def download_document(source):
    """
    Download one official government document.
    """

    scheme_folder = (
        KNOWLEDGE_BASE
        / source["category"]
        / source["scheme"]
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
    )

    destination = (
        scheme_folder
        / source["filename"]
    )

    print()
    print("=" * 75)
    print("DOCUMENT")
    print("=" * 75)

    print(f"Title       : {source['title']}")
    print(f"Scheme      : {source['scheme']}")
    print(f"Ministry    : {source['ministry']}")
    print(f"Source      : {source['source_url']}")
    print(f"Destination : {destination}")

    print("=" * 75)

    # --------------------------------------------------------
    # Already downloaded?
    # --------------------------------------------------------

    if (
        destination.exists()
        and destination.stat().st_size > 0
    ):

        size_mb = (
            destination.stat().st_size
            / (1024 * 1024)
        )

        print(
            f"Already exists "
            f"({size_mb:.2f} MB)"
        )

        print("Skipping download.")

        return True


    # --------------------------------------------------------
    # Request
    # --------------------------------------------------------

    try:

        request = Request(
            source["document_url"],
            headers={
                "User-Agent": (
                    "Mozilla/5.0 "
                    "(Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
                    "Chrome/153.0 Safari/537.36"
                )
            }
        )


        with urlopen(
            request,
            timeout=TIMEOUT
        ) as response:

            data = response.read()

            content_type = (
                response.headers.get(
                    "Content-Type",
                    ""
                )
            )


        # ----------------------------------------------------
        # Validate
        # ----------------------------------------------------

        if not data:

            print(
                "ERROR: Empty response received."
            )

            return False


        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        destination.write_bytes(data)


        size_mb = (
            len(data)
            / (1024 * 1024)
        )


        print()
        print("DOWNLOAD SUCCESSFUL")
        print(
            f"Size         : {size_mb:.2f} MB"
        )
        print(
            f"Content-Type : {content_type}"
        )


        return True


    except HTTPError as error:

        print()
        print(
            f"HTTP ERROR: {error.code}"
        )

        print(error.reason)

        return False


    except URLError as error:

        print()
        print("URL ERROR")

        print(error.reason)

        return False


    except TimeoutError:

        print()
        print("DOWNLOAD TIMEOUT")

        return False


    except Exception as error:

        print()
        print(
            f"UNEXPECTED ERROR: "
            f"{type(error).__name__}"
        )

        print(error)

        return False


# ============================================================
# METADATA
# ============================================================

def create_metadata(source):
    """
    Create metadata next to the PDF.

    This will later be used by the RAG ingestion
    pipeline to attach official source information
    to every retrieved chunk.
    """

    scheme_folder = (
        KNOWLEDGE_BASE
        / source["category"]
        / source["scheme"]
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
    )

    metadata_file = (
        scheme_folder
        / (
            Path(source["filename"]).stem
            + ".metadata.txt"
        )
    )


    metadata = f"""
DOCUMENT_ID: {source['id']}

TITLE: {source['title']}

SCHEME: {source['scheme']}

CATEGORY: {source['category']}

MINISTRY: {source['ministry']}

LANGUAGE: {source['language']}

SOURCE_STATUS: {source['source_status']}

SOURCE_URL: {source['source_url']}

DOCUMENT_URL: {source['document_url']}
""".strip()


    metadata_file.write_text(
        metadata,
        encoding="utf-8"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 75)
    print("COOPERATIVE MITRA")
    print("Government Knowledge Base")
    print("=" * 75)

    print()
    print("Project:")
    print(PROJECT_ROOT)

    print()
    print("Knowledge Base:")
    print(KNOWLEDGE_BASE)

    print()


    # --------------------------------------------------------
    # Create folders
    # --------------------------------------------------------

    create_directories()


    successful = 0
    failed = 0


    # --------------------------------------------------------
    # Download all sources
    # --------------------------------------------------------

    for source in SOURCES:

        success = download_document(
            source
        )


        if success:

            create_metadata(
                source
            )

            successful += 1

        else:

            failed += 1


        # Small delay between requests.
        time.sleep(1)


    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print()
    print("=" * 75)
    print("DOWNLOAD SUMMARY")
    print("=" * 75)

    print(
        f"Successful : {successful}"
    )

    print(
        f"Failed     : {failed}"
    )

    print()
    print(
        "Knowledge Base:"
    )

    print(
        KNOWLEDGE_BASE
    )

    print()


    if failed == 0:

        print(
            "All documents downloaded successfully."
        )

        print()
        print(
            "NEXT STEP:"
        )

        print(
            "Run the ingestion pipeline "
            "after we verify the files."
        )

    else:

        print(
            "Some documents failed to download."
        )

        print(
            "Do NOT continue to ingestion yet."
        )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()