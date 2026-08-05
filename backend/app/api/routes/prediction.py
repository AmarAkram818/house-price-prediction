import logging

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services import inference
from app.services.preprocessing import get_allowed_locations

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/locations")
def locations() -> list[str]:
    """List of location buckets the model was trained on (for the frontend dropdown)."""
    return get_allowed_locations()


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    if not inference.is_model_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded yet")
    try:
        price = inference.predict_price(payload)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed") from exc
    return PredictionResponse(predicted_price=price)
