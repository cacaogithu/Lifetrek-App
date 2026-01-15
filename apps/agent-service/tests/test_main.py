from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_webhook_ignored_invalid_table():
    payload = {
        "table": "wrong_table",
        "type": "INSERT",
        "record": {}
    }
    response = client.post("/webhook", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ignored"

def test_webhook_accepted():
    # Note: This will actually try to spawn a background task. 
    # In a real unit test, we should mock process_job.
    payload = {
        "table": "jobs",
        "type": "INSERT",
        "record": {
            "id": "123",
            "job_type": "test_job"
        }
    }
    response = client.post("/webhook", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "queued"
