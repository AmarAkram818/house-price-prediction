import json

import pandas as pd

from app.core.config import settings
from app.schemas.prediction import PredictionRequest

with open(settings.locations_path) as f:
    _ALLOWED_LOCATIONS = set(json.load(f))


def request_to_dataframe(payload: PredictionRequest) -> pd.DataFrame:
    """Build the exact one-row DataFrame the trained pipeline expects.

    Column names/order must match the `numeric_features` + `categorical_features`
    used in notebooks/house_price_model.ipynb. Because the exported model is a
    full sklearn Pipeline (imputers + scaler + one-hot encoder + regressor), no
    manual encoding is needed here.
    """
    location_grouped = payload.location if payload.location in _ALLOWED_LOCATIONS else "other"

    row = {
        "carpet_area_sqft": payload.carpet_area_sqft,
        "floor_num": payload.floor_num,
        "bathroom": payload.bathroom,
        "balcony": payload.balcony,
        "location_grouped": location_grouped,
        "Furnishing": payload.furnishing,
        "Transaction": payload.transaction,
        "Ownership": payload.ownership,
        "facing": payload.facing,
    }
    return pd.DataFrame([row])


def get_allowed_locations() -> list[str]:
    return sorted(_ALLOWED_LOCATIONS)
