import logging

import joblib
import numpy as np

from app.core.config import settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe

logger = logging.getLogger(__name__)

_model = None  # loaded once at startup via load_model()


def load_model() -> None:
    global _model
    logger.info("Loading model from %s", settings.model_path)
    _model = joblib.load(settings.model_path)
    logger.info("Model loaded successfully")


def is_model_loaded() -> bool:
    return _model is not None


def predict_price(payload: PredictionRequest) -> float:
    if _model is None:
        raise RuntimeError("Model is not loaded yet")

    df = request_to_dataframe(payload)
    # The model was trained on log1p(price); invert with expm1 to get INR.
    log_pred = _model.predict(df)[0]
    price = float(np.expm1(log_pred))
    return price
