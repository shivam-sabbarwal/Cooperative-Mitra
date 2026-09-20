def test_list_schemes(client):
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 1
    assert any(s["code"] == "TEST_SCHEME" for s in schemes)

def test_filter_schemes_by_category(client):
    response = client.get("/api/v1/schemes?category=INFRASTRUCTURE")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 1
    assert all("INFRASTRUCTURE" in s["category"] for s in schemes)

def test_scheme_details(client):
    response = client.get("/api/v1/schemes/TEST_SCHEME")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "TEST_SCHEME"
    assert data["source_type"] == "OFFICIAL"

def test_eligibility_check_eligible(client):
    payload = {
        "scheme_code": "TEST_SCHEME",
        "applicant_type": "INDIVIDUAL_FARMER",
        "land_holding_acres": 4.5,
        "is_pacs_member": True
    }
    response = client.post("/api/v1/schemes/check-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is True
    assert len(data["matched_criteria"]) >= 2
    assert "OFFICIAL NOTE" in data["official_disclaimer"]

def test_eligibility_check_ineligible(client):
    payload = {
        "scheme_code": "TEST_SCHEME",
        "applicant_type": "INDIVIDUAL_FARMER",
        "land_holding_acres": 25.0, # Exceeds 10.0 acres ceiling
        "is_pacs_member": False     # Requires PACS membership
    }
    response = client.post("/api/v1/schemes/check-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is False
    assert len(data["missing_criteria"]) >= 1
