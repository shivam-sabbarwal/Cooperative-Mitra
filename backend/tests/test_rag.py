import pytest
from backend.app.services.rag_service import rag_service
from backend.app.services.llm_service import llm_service

def test_intent_classification():
    assert rag_service.classify_intent("How to file a grievance about PACS loan?") == "GRIEVANCE"
    assert rag_service.classify_intent("मुझे खाद वितरण की शिकायत दर्ज करनी है") == "GRIEVANCE"
    assert rag_service.classify_intent("पॅक्स कर्जाबद्दल तक्रार कशी नोंदवायची?") == "GRIEVANCE"
    assert rag_service.classify_intent("ప్యాక్స్ ఎరువుల పంపిణీపై ఫిర్యాదు ఎలా చేయాలి?") == "GRIEVANCE"
    assert rag_service.classify_intent("Tell me about Yuva Sahakar scheme subsidies") == "SCHEME"
    assert rag_service.classify_intent("युवा सहकार योजना सबसिडीबद्दल सांगा") == "SCHEME"
    assert rag_service.classify_intent("యువ సహకార పథకం సబ్సిడీ వివరాలు ఏమిటి?") == "SCHEME"
    assert rag_service.classify_intent("What is Section 84 of MSCS Act regarding arbitration?") == "LEGAL"
    assert rag_service.classify_intent("सहकारी कायदा कलम ८४ काय सांगते?") == "LEGAL"
    assert rag_service.classify_intent("సహకార చట్టం సెక్షన్ 84 వివరణ ఇవ్వండి") == "LEGAL"
    assert rag_service.classify_intent("What is PMFBY crop insurance?") == "SCHEME"
    assert rag_service.classify_intent("प्रधानमंत्री फसल बीमा योजना क्या है?") == "SCHEME"
    assert rag_service.classify_intent("What is EMI and interest?") == "FINANCIAL_LITERACY"
    assert rag_service.classify_intent("डिजिटल भुगतान धोखाधड़ी से कैसे बचें?") == "FINANCIAL_LITERACY"

def test_chromadb_retrieval_and_citations():
    chunks, citations = rag_service.retrieve("PACS computerization ERP grant NABARD", n_results=2)
    assert len(chunks) > 0
    assert len(citations) > 0
    top_citation = citations[0]
    assert top_citation.title != ""
    assert top_citation.source_type in ["OFFICIAL", "PLACEHOLDER"]

def test_chat_endpoint_english(client):
    payload = {
        "message": "What is the NCDC Yuva Sahakar scheme?",
        "language": "en",
        "enable_voice_response": False
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert data["intent"] == "SCHEME"
    assert len(data["citations"]) > 0
    assert data["grounded"] is True

def test_chat_endpoint_hindi(client):
    payload = {
        "message": "पैक्स के कंप्यूटरीकरण की योजना क्या है?",
        "language": "hi",
        "enable_voice_response": False
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "hi"

def test_chat_endpoint_marathi(client):
    payload = {
        "message": "पॅक्स संगणकीकरण योजनेचे फायदे काय आहेत?",
        "language": "mr",
        "enable_voice_response": False
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "mr"

def test_chat_endpoint_telugu(client):
    payload = {
        "message": "ప్యాక్స్ కంప్యూటరీకరణ పథకం ప్రయోజనాలు ఏమిటి?",
        "language": "te",
        "enable_voice_response": False
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "te"

def test_chat_endpoint_unverified_fallback(client):
    # Query something completely unrelated to cooperative societies
    payload = {
        "message": "What is the distance between Pluto and Mars in astronomical units?",
        "language": "en",
        "enable_voice_response": False
    }
    # It should still execute safely and return citations or grounded guardrail
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
