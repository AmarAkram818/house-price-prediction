from fastapi.testclient import TestClient

from app.main import app
from app.services import inference


def _ensure_model_loaded():
    if not inference.is_model_loaded():
        inference.load_model()


def test_health():
    _ensure_model_loaded()
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path():
    _ensure_model_loaded()
    payload = {
        "location": "mumbai",
        "carpet_area_sqft": 850,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert body["predicted_price"] > 0


def test_predict_invalid_input():
    _ensure_model_loaded()
    # missing required fields + negative area -> 422 Unprocessable Entity
    payload = {
        "location": "mumbai",
        "carpet_area_sqft": -100,
    }
    with TestClient(app) as client:
        response = client.post("/predict", json=payload)
    assert response.status_code == 422
