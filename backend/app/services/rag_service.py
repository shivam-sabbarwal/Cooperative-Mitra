import re
import chromadb

from typing import Optional

from sentence_transformers import SentenceTransformer

from backend.app.config import settings
from backend.app.core.logging_config import logger
from backend.app.schemas.chat import CitationSource


class RAGService:

    # Cosine distance above this level is not sufficiently related to present
    # government information as a factual answer.
    MAX_RETRIEVAL_DISTANCE = 0.85

    def __init__(self):

        self.persist_dir = (
            settings.CHROMA_PERSIST_DIRECTORY
        )

        self.collection_name = (
            settings.CHROMA_COLLECTION_NAME
        )

        self.embedding_model_name = (
            settings.EMBEDDING_MODEL
        )

        self.client = None
        self.collection = None
        self.embedding_model = None

        self._initialize_embedding_model()
        self._initialize_collection()


    # ========================================================
    # EMBEDDING MODEL
    # ========================================================

    def _initialize_embedding_model(self):

        try:

            logger.info(
                f"Loading multilingual embedding model: "
                f"{self.embedding_model_name}"
            )

            self.embedding_model = (
                SentenceTransformer(
                    self.embedding_model_name
                )
            )

            logger.info(
                "Multilingual embedding model loaded successfully."
            )

        except Exception as e:

            logger.error(
                f"Failed to load embedding model: {e}"
            )

            self.embedding_model = None


    # ========================================================
    # CHROMADB
    # ========================================================

    def _initialize_collection(self):

        try:

            self.client = chromadb.PersistentClient(
                path=self.persist_dir
            )

            self.collection = (
                self.client.get_or_create_collection(

                    name=self.collection_name,

                    metadata={
                        "hnsw:space": "cosine"
                    }

                )
            )

            count = self.collection.count()

            logger.info(
                f"ChromaDB connected. "
                f"Collection '{self.collection_name}' "
                f"has {count} items."
            )

        except Exception as e:

            logger.error(
                f"Failed to initialize ChromaDB collection: {e}"
            )

            self.collection = None


    # ========================================================
    # INTENT CLASSIFICATION
    # ========================================================

    def classify_intent(
        self,
        query: str
    ) -> str:

        """Classify user query intent."""

        q = query.lower()

        # Financial literacy is educational content, kept separate from
        # scheme/loan lookup so answers always carry the correct safeguards.
        if any(w in q for w in [
            "interest", "emi", "credit score", "digital payment", "payment fraud",
            "scam", "savings", "compound interest", "simple interest",
            "financial literacy", "financial education", "otp", "pin",
            "ब्याज", "ईएमआई", "वित्तीय", "धोखाधड़ी",
            "ಬಡ್ಡಿ", "ಹಣಕಾಸು", "ವಂಚನೆ",
            "व्याज", "आर्थिक", "फसवणूक",
            "వడ్డీ", "ఆర్థిక", "మోసం"
        ]):
            return "FINANCIAL_LITERACY"


        # ----------------------------------------------------
        # GRIEVANCE
        # ----------------------------------------------------

        if any(
            w in q
            for w in [

                "grievance",
                "complaint",
                "track",
                "status",
                "ticket",

                "शिकायत",
                "दೂರು",
                "तक्रार",
                "फिर्याद",

                "ఫిర్యాదు"

            ]
        ):

            return "GRIEVANCE"


        # ----------------------------------------------------
        # SCHEME
        # ----------------------------------------------------

        elif any(
            w in q
            for w in [

                # English
                "scheme",
                "subsidy",
                "ncdc",
                "yuva",
                "ayushman",
                "grant",
                "loan",
                "pmfby",
                "crop insurance",
                "fasal bima",
                "फसल बीमा",
                "फसल विमा",
                "ಫಸಲ್ ಬಿಮಾ",
                "ఫసల్ బీమా",

                # PMAY / Housing
                "pmay",
                "pmay-u",
                "pmay-g",
                "pmay u",
                "pmay g",
                "pradhan mantri awas",
                "pradhan mantri avas",
                "pradhan mantri housing",
                "awas yojana",
                "awas",
                "housing scheme",

                # Hindi
                "योजना",
                "अनुदान",
                "कर्ज",
                "प्रधानमंत्री आवास",
                "प्रधान मंत्री आवास",
                "आवास योजना",
                "आवास",

                # Kannada
                "ಯೋಜನೆ",
                "ಸಾಲ",
                "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ",
                "ಪ್ರಧಾನ ಮಂತ್ರಿ ವಸತಿ",
                "ವಸತಿ ಯೋಜನೆ",
                "ವಸತಿ",

                # Marathi
                "योजना",
                "अनुदान",
                "कर्ज",
                "प्रधानमंत्री आवास",
                "प्रधान मंत्री आवास",
                "आवास योजना",
                "घरकुल",

                # Telugu
                "పథకం",
                "సబ్సిడీ",
                "రుణం",
                "ప్రధాన మంత్రి ఆవాస్",
                "ప్రధాన మంత్రి ఆవాస",
                "ప్రధానమంత్రి గృహ",
                "గృహ పథకం",
                "ఆవాసం"

            ]
        ):

            return "SCHEME"


        # ----------------------------------------------------
        # LEGAL
        # ----------------------------------------------------

        elif any(
            w in q
            for w in [

                "law",
                "act",
                "section",
                "mscs",
                "bye-law",
                "byelaw",
                "rule",
                "election",

                "कानून",
                "अधिनियम",
                "धारा",

                "ಕಾಯ್ದೆ",
                "ನಿಯಮ",

                "कायदा",
                "कलम",

                "చట్టం",
                "సెక్షన్",
                "నిబంధన"

            ]
        ):

            return "LEGAL"


        # ----------------------------------------------------
        # GENERAL PACS
        # ----------------------------------------------------

        elif any(
            w in q
            for w in [

                "pacs",
                "membership",
                "secretary",
                "cooperative",

                "पैक्स",
                "संस्था",
                "सहकारी",

                "ಸಂಘ",

                "సొసైటీ",
                "సహకార"

            ]
        ):

            return "GENERAL_PACS"


        return "GENERAL"


    # ========================================================
    # QUERY EXPANSION
    # ========================================================

    def _prepare_query(
        self,
        query: str,
        intent: Optional[str]
    ) -> str:

        """
        Prepare a retrieval-friendly query.

        The original user language is preserved.
        English canonical terms are added only for known
        government-scheme aliases.
        """

        q = query.strip()

        q_lower = q.lower()

        expansion_terms = []


        # ----------------------------------------------------
        # PMAY
        # ----------------------------------------------------

        pmay_aliases = [

            "pmay",
            "pmay-u",
            "pmay-g",
            "pmay u",
            "pmay g",

            "pradhan mantri awas",
            "pradhan mantri avas",
            "pradhan mantri housing",

            "प्रधानमंत्री आवास",
            "प्रधान मंत्री आवास",
            "आवास योजना",

            "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ",
            "ಪ್ರಧಾನ ಮಂತ್ರಿ ವಸತಿ",

            "ప్రధాన మంత్రి ఆవాస్",
            "ప్రధాన మంత్రి ఆవాస",
            "ప్రధానమంత్రి గృహ"

        ]

        if (
            intent == "SCHEME"
            and any(
                term in q_lower
                for term in pmay_aliases
            )
        ):

            expansion_terms.extend(
                [
                    "PMAY",
                    "Pradhan Mantri Awas Yojana",
                    "PMAY Urban",
                    "PMAY-U",
                    "PMAY-U 2.0",
                    "PMAY Gramin",
                    "PMAY-G",
                    "housing scheme"
                ]
            )

        elif intent == "SCHEME" and any(
            term in q_lower
            for term in ["pm-kisan", "pm kisan", "पीएम किसान", "ಪಿಎಂ ಕಿಸಾನ್", "పీఎం కిసాన్"]
        ):

            expansion_terms.extend([
                "PM-KISAN",
                "Pradhan Mantri Kisan Samman Nidhi",
                "farmer income support scheme",
            ])

        elif intent == "SCHEME" and any(
            term in q_lower
            for term in [
                "pmfby", "fasal bima", "crop insurance", "फसल बीमा",
                "ಫಸಲ್ ಬಿಮಾ", "फसल विमा", "ఫసల్ బీమా"
            ]
        ):
            expansion_terms.extend([
                "PMFBY", "Pradhan Mantri Fasal Bima Yojana",
                "crop insurance official guideline",
            ])

        elif intent == "FINANCIAL_LITERACY":
            expansion_terms.extend([
                "financial literacy educational guidance",
                "loan interest savings digital payment safety",
            ])


        # ----------------------------------------------------
        # General scheme query
        # ----------------------------------------------------

        elif intent == "SCHEME":

            expansion_terms.extend(
                [
                    "government scheme",
                    "scheme benefits",
                    "scheme eligibility"
                ]
            )


        if expansion_terms:

            return (
                q
                + " "
                + " ".join(expansion_terms)
            )

        return q


    # ========================================================
    # QUERY TYPE DETECTION
    # ========================================================

    def _detect_query_focus(
        self,
        query: str
    ) -> str:

        """
        Detect what the user is asking about.

        Used only for reranking retrieved candidates.
        """

        q = query.lower()


        # ----------------------------------------------------
        # WHAT IS / OVERVIEW
        # ----------------------------------------------------

        overview_terms = [

            "what is",
            "what are",
            "tell me about",
            "explain",
            "meaning",
            "about",

            "क्या है",
            "क्या होता है",
            "बताइए",
            "जानकारी",

            "ಏನು",
            "ಎಂದರೇನು",

            "म्हणजे काय",
            "माहिती",

            "ఏమిటి",
            "అంటే ఏమిటి",
            "గురించి చెప్పండి"

        ]

        if any(
            term in q
            for term in overview_terms
        ):

            return "OVERVIEW"


        # ----------------------------------------------------
        # ELIGIBILITY
        # ----------------------------------------------------

        eligibility_terms = [

            "eligible",
            "eligibility",
            "who can apply",
            "who is eligible",
            "qualify",
            "qualification",

            "पात्र",
            "पात्रता",
            "कौन पात्र",

            "ಅರ್ಹ",
            "ಅರ್ಹತೆ",

            "पात्र",
            "पात्रता",

            "అర్హత",
            "ఎవరు అర్హులు",
            "అర్హులు"

        ]

        if any(
            term in q
            for term in eligibility_terms
        ):

            return "ELIGIBILITY"


        # ----------------------------------------------------
        # BENEFITS / ASSISTANCE
        # ----------------------------------------------------

        benefit_terms = [

            "benefit",
            "benefits",
            "assistance",
            "financial assistance",
            "amount",
            "fund",
            "support",

            "लाभ",
            "सहायता",
            "राशि",

            "ಪ್ರಯೋಜನ",
            "ಸಹಾಯ",

            "फायदे",
            "मदत",

            "ప్రయోజనాలు",
            "సహాయం",
            "మొత్తం"

        ]

        if any(
            term in q
            for term in benefit_terms
        ):

            return "BENEFITS"


        # ----------------------------------------------------
        # APPLICATION / PROCESS
        # ----------------------------------------------------

        application_terms = [

            "apply",
            "application",
            "how to apply",
            "process",
            "procedure",
            "registration",

            "आवेदन",
            "कैसे आवेदन",
            "प्रक्रिया",

            "ಅರ್ಜಿ",
            "ಹೇಗೆ ಅರ್ಜಿ",
            "ಪ್ರಕ್ರಿಯೆ",

            "अर्ज",
            "प्रक्रिया",

            "దరఖాస్తు",
            "ఎలా దరఖాస్తు",
            "ప్రక్రియ"

        ]

        if any(
            term in q
            for term in application_terms
        ):

            return "APPLICATION"

        if any(term in q for term in [
            "claim", "loss", "settlement", "दावा", "ಕ್ಲೈಮ್", "દાવો", "క్లెయిమ్"
        ]):
            return "CLAIM"

        if any(term in q for term in [
            "premium", "प्रीमियम", "ಪ್ರೀಮಿಯಂ", "प्रिमियम", "ప్రీమియం"
        ]):
            return "PREMIUM"


        return "GENERAL"


    # ========================================================
    # TEXT RERANKING
    # ========================================================

    def _rerank_chunks(
        self,
        query: str,
        chunks: list[dict],
        intent: Optional[str]
    ) -> list[dict]:

        """
        Rerank Chroma candidates using:

        1. Semantic distance
        2. Query-focused lexical signals
        3. Relevant explanatory language
        4. Penalty for glossary/abbreviation chunks
        """

        if not chunks:
            return []


        focus = self._detect_query_focus(query)

        q = query.lower()


        scored = []


        for chunk in chunks:

            text = (
                chunk.get("text") or ""
            )

            metadata = (
                chunk.get("metadata") or {}
            )

            distance = float(
                chunk.get("distance", 1.0)
            )

            text_lower = text.lower()


            # ------------------------------------------------
            # Base semantic score
            # ------------------------------------------------

            semantic_score = 1.0 - distance


            score = semantic_score * 10.0

            # Prefer authoritative, current records.  This does not discard
            # placeholders; their status remains visible to the user.
            source_status = str(metadata.get("source_status", "")).upper()
            if source_status == "OFFICIAL":
                score += 1.0
            elif source_status == "VERIFIED_SECONDARY":
                score += 0.35
            elif source_status == "PLACEHOLDER":
                score -= 1.5

            if str(metadata.get("status", "ACTIVE")).upper() != "ACTIVE":
                score -= 2.0

            # Exact scheme/entity references should outrank broad semantic
            # matches, while preserving multilingual embedding retrieval.
            scheme = str(metadata.get("scheme", "")).lower()
            if scheme and scheme in q:
                score += 3.0

            if intent == "LEGAL":
                section = str(metadata.get("section", "")).lower()
                section_match = re.search(r"(?:section|sec\.?|धारा|ಕಲಂ|సెక్షన్)\s*(\d+[a-z]?)", q)
                if section_match and section_match.group(1) in section:
                    score += 3.0


            # ------------------------------------------------
            # Scheme boost
            # ------------------------------------------------

            if intent == "SCHEME":

                score += 1.5


                # PMAY canonical terms
                pmay_terms = [

                    "pradhan mantri awas yojana",
                    "pmay-u 2.0",
                    "pmay-u",
                    "pmay-g",
                    "pmay",
                    "housing"

                ]

                pmay_matches = sum(
                    1
                    for term in pmay_terms
                    if term in text_lower
                )

                score += min(
                    pmay_matches * 0.8,
                    3.0
                )

                agriculture_terms = ["pmfby", "fasal bima", "crop insurance", "agriculture"]
                if any(term in q for term in agriculture_terms):
                    score += min(sum(term in text_lower for term in agriculture_terms) * 0.8, 3.0)

            elif intent == "FINANCIAL_LITERACY":
                if str(metadata.get("category", "")).upper() == "FINANCIAL_LITERACY":
                    score += 4.0


            # ------------------------------------------------
            # Overview query boost
            # ------------------------------------------------

            if focus == "OVERVIEW":

                overview_phrases = [

                    "objective",
                    "objectives",
                    "purpose",
                    "overview",
                    "introduction",
                    "aim",
                    "implemented",
                    "provides",
                    "aims to",
                    "the scheme",
                    "under the scheme",

                    "परिचय",
                    "उद्देश्य",
                    "योजना का उद्देश्य",

                    "ಪರಿಚಯ",
                    "ಉದ್ದೇಶ",

                    "పరిచయం",
                    "లక్ష్యం",
                    "ఉద్దేశ్యం"

                ]

                matches = sum(
                    1
                    for phrase in overview_phrases
                    if phrase in text_lower
                )

                score += min(
                    matches * 0.45,
                    2.5
                )


            # ------------------------------------------------
            # Eligibility boost
            # ------------------------------------------------

            elif focus == "ELIGIBILITY":

                eligibility_phrases = [

                    "eligible",
                    "eligibility",
                    "beneficiary",
                    "beneficiaries",
                    "household",
                    "applicant",
                    "criteria",
                    "qualify",

                    "पात्र",
                    "पात्रता",
                    "लाभार्थी",

                    "ಅರ್ಹ",
                    "ಅರ್ಹತೆ",

                    "अर्जदार",

                    "అర్హత",
                    "లబ్ధిదారు",
                    "లబ్ధిదారులు"

                ]

                matches = sum(
                    1
                    for phrase in eligibility_phrases
                    if phrase in text_lower
                )

                score += min(
                    matches * 0.5,
                    3.0
                )


            # ------------------------------------------------
            # Benefits boost
            # ------------------------------------------------

            elif focus == "BENEFITS":

                benefit_phrases = [

                    "benefit",
                    "benefits",
                    "assistance",
                    "financial assistance",
                    "central assistance",
                    "funding",
                    "amount",
                    "support",

                    "लाभ",
                    "सहायता",
                    "वित्तीय सहायता",

                    "ಪ್ರಯೋಜನ",
                    "ಸಹಾಯ",

                    "फायदे",
                    "मदत",

                    "ప్రయోజన",
                    "సహాయం",
                    "ఆర్థిక సహాయం"

                ]

                matches = sum(
                    1
                    for phrase in benefit_phrases
                    if phrase in text_lower
                )

                score += min(
                    matches * 0.5,
                    3.0
                )


            # ------------------------------------------------
            # Application/process boost
            # ------------------------------------------------

            elif focus == "APPLICATION":

                process_phrases = [

                    "application",
                    "apply",
                    "applicant",
                    "procedure",
                    "process",
                    "registration",
                    "online",
                    "portal",

                    "आवेदन",
                    "प्रक्रिया",
                    "पंजीकरण",

                    "ಅರ್ಜಿ",
                    "ಪ್ರಕ್ರಿಯೆ",
                    "ನೋಂದಣಿ",

                    "अर्ज",
                    "प्रक्रिया",
                    "नोंदणी",

                    "దరఖాస్తు",
                    "ప్రక్రియ",
                    "నమోదు"

                ]

                matches = sum(
                    1
                    for phrase in process_phrases
                    if phrase in text_lower
                )

                score += min(
                    matches * 0.5,
                    3.0
                )


            # ------------------------------------------------
            # Glossary / abbreviation penalty
            # ------------------------------------------------

            glossary_signals = [

                "abbreviations",
                "abbreviation",
                "acronym",
                "list of abbreviations",
                "glossary",
                "means the following",
                "means:",
                "project management unit",
                "public private partnership",
                "request for proposal",
                "real estate (regulation",

            ]

            glossary_matches = sum(
                1
                for signal in glossary_signals
                if signal in text_lower
            )

            if glossary_matches > 0:

                # Strong penalty because a glossary chunk
                # is usually not an answer to "What is PMAY?"
                if focus == "OVERVIEW":

                    score -= 5.0

                else:

                    score -= 2.0


            # ------------------------------------------------
            # Extremely short chunks penalty
            # ------------------------------------------------

            if len(text.strip()) < 250:

                score -= 0.5


            # ------------------------------------------------
            # Store score
            # ------------------------------------------------

            chunk["rerank_score"] = score

            scored.append(chunk)


        # ----------------------------------------------------
        # Sort highest score first
        # ----------------------------------------------------

        scored.sort(
            key=lambda x: x.get(
                "rerank_score",
                0.0
            ),
            reverse=True
        )


        return scored


    # ========================================================
    # RETRIEVAL
    # ========================================================

    def retrieve(
        self,
        query: str,
        n_results: int = 5,
        language: Optional[str] = None,
        intent: Optional[str] = None
    ) -> tuple[
        list[dict],
        list[CitationSource]
    ]:

        """
        Retrieve relevant context chunks and construct
        verified citations.

        Uses the same multilingual SentenceTransformer
        embedding model used during ingestion.

        Retrieval pipeline:

        Query
          ↓
        Intent
          ↓
        Query expansion
          ↓
        Chroma category filtering
          ↓
        Candidate retrieval
          ↓
        Reranking
          ↓
        Top relevant chunks
        """

        # ----------------------------------------------------
        # Determine intent
        # ----------------------------------------------------

        if intent is None:

            intent = self.classify_intent(
                query
            )

        logger.debug(
            f"RAG retrieval intent: {intent}"
        )


        # ----------------------------------------------------
        # Prepare query
        # ----------------------------------------------------

        search_query = self._prepare_query(
            query,
            intent
        )

        logger.debug(
            f"RAG search query: {search_query}"
        )


        # ----------------------------------------------------
        # Ensure ChromaDB exists
        # ----------------------------------------------------

        if not self.collection:

            self._initialize_collection()

            if not self.collection:

                return [], []


        # ----------------------------------------------------
        # Ensure embedding model exists
        # ----------------------------------------------------

        if not self.embedding_model:

            self._initialize_embedding_model()

            if not self.embedding_model:

                logger.error(
                    "Embedding model unavailable."
                )

                return [], []


        # ----------------------------------------------------
        # Empty collection check
        # ----------------------------------------------------

        collection_count = (
            self.collection.count()
        )

        if collection_count == 0:

            logger.warning(
                "ChromaDB collection is empty."
            )

            return [], []


        try:

            # ------------------------------------------------
            # Generate query embedding
            # ------------------------------------------------

            query_embedding = (
                self.embedding_model.encode(

                    [search_query],

                    normalize_embeddings=True

                ).tolist()
            )


            # ------------------------------------------------
            # Candidate count
            # ------------------------------------------------

            candidate_count = min(
                max(
                    n_results * 4,
                    12
                ),
                collection_count
            )


            # ------------------------------------------------
            # Build Chroma query
            # ------------------------------------------------

            query_kwargs = {

                "query_embeddings": query_embedding,

                "n_results": candidate_count

            }


            # ------------------------------------------------
            # Category filtering
            # ------------------------------------------------

            if intent == "SCHEME":

                query_kwargs["where"] = {
                    "category": "SCHEME"
                }

            elif intent == "FINANCIAL_LITERACY":

                query_kwargs["where"] = {
                    "category": "FINANCIAL_LITERACY"
                }


            elif intent == "LEGAL":

                query_kwargs["where"] = {

                    "category": {
                        "$in": [
                            "LEGAL",
                            "BYELAW"
                        ]
                    }

                }

            elif intent == "GENERAL_PACS":

                query_kwargs["where"] = {
                    "category": {
                        "$in": [
                            "PACS",
                            "BYELAW",
                        ]
                    }
                }


            # ------------------------------------------------
            # Query Chroma
            # ------------------------------------------------

            results = self.collection.query(
                **query_kwargs
            )


            retrieved_chunks = []
            citations = []


            # ------------------------------------------------
            # Process results
            # ------------------------------------------------

            if (
                results
                and results.get("documents")
                and len(results["documents"][0]) > 0
            ):

                docs = results["documents"][0]

                metas = (
                    results["metadatas"][0]
                    if results.get("metadatas")
                    else []
                )

                distances = (

                    results["distances"][0]

                    if results.get("distances")

                    else [
                        0.0
                    ] * len(docs)

                )


                for i, doc_text in enumerate(
                    docs
                ):

                    meta = (

                        metas[i]

                        if i < len(metas)

                        else {}

                    )

                    dist = (

                        distances[i]

                        if i < len(distances)

                        else 0.0

                    )


                    retrieved_chunks.append({

                        "text": doc_text,

                        "metadata": meta,

                        "distance": dist

                    })


            # ------------------------------------------------
            # Rerank candidates
            # ------------------------------------------------

            retrieved_chunks = (
                self._rerank_chunks(
                    query,
                    retrieved_chunks,
                    intent
                )
            )

            if (
                retrieved_chunks
                and float(retrieved_chunks[0].get("distance", 1.0))
                > self.MAX_RETRIEVAL_DISTANCE
            ):
                logger.info(
                    "Top retrieval result did not meet the relevance threshold."
                )
                return [], []


            # ------------------------------------------------
            # Keep only final requested results
            # ------------------------------------------------

            retrieved_chunks = (
                retrieved_chunks[:n_results]
            )


            # ------------------------------------------------
            # Build citations
            # ------------------------------------------------

            for chunk in retrieved_chunks:

                doc_text = (
                    chunk.get("text") or ""
                )

                meta = (
                    chunk.get("metadata") or {}
                )


                source_type = meta.get(
                    "source_type",
                    "OFFICIAL"
                )


                if source_type == "PLACEHOLDER":

                    logger.warning(
                        "Retrieved placeholder "
                        f"document: {meta.get('doc_id')}"
                    )


                citations.append(

                    CitationSource(

                        title=meta.get(
                            "title",
                            "Cooperative Document"
                        ),

                        doc_id=meta.get(
                            "doc_id",
                            "DOC_UNKNOWN"
                        ),

                        section=(
                            f"Chunk "
                            f"{meta.get('chunk_index', 0) + 1}"
                        ),

                        source_type=source_type,

                        source_status=meta.get(
                            "source_status",
                            source_type,
                        ),

                        source_url=(
                            meta.get(
                                "official_url"
                            )
                            or None
                        ),

                        act=(
                            meta.get("act")
                            or None
                        ),

                        page=(
                            meta.get("page")
                            or None
                        ),

                        excerpt=(

                            doc_text[:200] + "..."

                            if len(doc_text) > 200

                            else doc_text

                        )

                    )

                )


            # ------------------------------------------------
            # Logging
            # ------------------------------------------------

            logger.info(
                f"RAG retrieval completed. "
                f"Language={language or 'auto'}, "
                f"Intent={intent}, "
                f"Candidates={candidate_count}, "
                f"FinalResults={len(retrieved_chunks)}"
            )


            # Debug information for development
            for index, chunk in enumerate(
                retrieved_chunks
            ):

                metadata = (
                    chunk.get("metadata") or {}
                )

                logger.debug(
                    f"RAG result #{index + 1}: "
                    f"title={metadata.get('title')} "
                    f"distance={chunk.get('distance')} "
                    f"rerank={chunk.get('rerank_score')}"
                )


            return (
                retrieved_chunks,
                citations
            )


        except Exception as e:

            logger.error(
                f"Error during RAG retrieval: {e}"
            )

            return [], []


# ============================================================
# GLOBAL SERVICE INSTANCE
# ============================================================

rag_service = RAGService()
