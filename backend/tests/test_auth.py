def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "components" in data

def test_user_registration(client):
    payload = {
        "phone": "9998887770",
        "email": "newuser@test.com",
        "full_name": "Ramesh Kumar",
        "password": "Password@123",
        "role": "MEMBER",
        "language": "hi",
        "pacs_name": "Mandya Farmers PACS",
        "district": "Mandya",
        "state": "Karnataka"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == "9998887770"
    assert data["user"]["language"] == "hi"

def test_duplicate_registration_fails(client):
    payload = {
        "phone": "9998887770",
        "email": "newuser2@test.com",
        "full_name": "Ramesh Kumar 2",
        "password": "Password@123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_user_login(client):
    payload = {
        "phone_or_email": "9876543210",
        "password": "Pass123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == "9876543210"

def test_user_me_profile(client, member_token):
    headers = {"Authorization": f"Bearer {member_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["phone"] == "9123456789"

def test_user_update_profile(client, member_token):
    headers = {"Authorization": f"Bearer {member_token}"}
    update_payload = {
        "language": "kn",
        "pacs_name": "Mysuru Central PACS"
    }
    response = client.put("/api/v1/auth/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "kn"
    assert data["pacs_name"] == "Mysuru Central PACS"

def test_user_language_preferences_mr_and_te(client, member_token):
    headers = {"Authorization": f"Bearer {member_token}"}
    # Update to Marathi
    res_mr = client.put("/api/v1/auth/me", json={"language": "mr"}, headers=headers)
    assert res_mr.status_code == 200
    assert res_mr.json()["language"] == "mr"

    # Update to Telugu
    res_te = client.put("/api/v1/auth/me", json={"language": "te"}, headers=headers)
    assert res_te.status_code == 200
    assert res_te.json()["language"] == "te"
