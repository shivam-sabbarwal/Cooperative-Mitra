def test_list_legal_acts(client):
    response = client.get("/api/v1/legal/acts")
    assert response.status_code == 200
    acts = response.json()
    assert len(acts) >= 1
    assert any(a["act_code"] == "TEST_ACT" for a in acts)

def test_search_legal_sections(client):
    response = client.get("/api/v1/legal/sections/search?q=democratic&language=en")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert "Democratic Control" in results[0]["section_title"]
    assert "One member one vote" in results[0]["simplified_text"]
