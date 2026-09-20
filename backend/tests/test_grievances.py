def test_submit_grievance(client, member_token):
    headers = {"Authorization": f"Bearer {member_token}"}
    payload = {
        "category": "LOAN_DISBURSEMENT",
        "priority": "HIGH",
        "pacs_name": "Shivamogga Farmers PACS",
        "district": "Shivamogga",
        "state": "Karnataka",
        "subject": "Delayed KCC crop loan disbursement for Kharif season",
        "description": "I submitted all land records and passbooks 4 weeks ago but loan sanction is still pending without explanation."
    }
    response = client.post("/api/v1/grievances", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "ticket_number" in data
    assert data["ticket_number"].startswith("CM-")
    assert data["status"] == "SUBMITTED"
    assert data["subject"] == payload["subject"]

    # Public tracking by ticket number
    ticket = data["ticket_number"]
    track_resp = client.get(f"/api/v1/grievances/track/{ticket}")
    assert track_resp.status_code == 200
    track_data = track_resp.json()
    assert track_data["ticket_number"] == ticket
    assert track_data["status"] == "SUBMITTED"

def test_admin_update_grievance_status(client, admin_token, member_token):
    # Member submits
    m_headers = {"Authorization": f"Bearer {member_token}"}
    payload = {
        "category": "FERTILIZER_SUPPLY",
        "priority": "MEDIUM",
        "pacs_name": "Mandya PACS",
        "district": "Mandya",
        "state": "Karnataka",
        "subject": "Urea availability inquiry",
        "description": "Need information on date of arrival for subsidized DAP and Urea fertilizer stock."
    }
    submit_res = client.post("/api/v1/grievances", json=payload, headers=m_headers)
    g_id = submit_res.json()["id"]

    # Admin updates status
    a_headers = {"Authorization": f"Bearer {admin_token}"}
    update_payload = {
        "status": "IN_PROGRESS",
        "resolution_notes": "Stock allocated from district warehouse; dispatching tomorrow.",
        "assigned_to": "Officer K. Narayanan"
    }
    patch_res = client.patch(f"/api/v1/grievances/{g_id}/status", json=update_payload, headers=a_headers)
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "IN_PROGRESS"
    assert updated["assigned_to"] == "Officer K. Narayanan"
