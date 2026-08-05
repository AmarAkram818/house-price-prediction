from typing import Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Input features required to predict a house price.

    Field names mirror the features used to train the model in
    notebooks/house_price_model.ipynb (see section 2.4).
    """

    location: str = Field(..., examples=["mumbai"], description="City/locality slug")
    carpet_area_sqft: float = Field(..., gt=0, examples=[850.0])
    floor_num: int = Field(..., examples=[3], description="Floor number (0 = ground, -1 = basement)")
    bathroom: int = Field(..., ge=0, examples=[2])
    balcony: int = Field(..., ge=0, examples=[1])
    furnishing: str = Field(..., examples=["Semi-Furnished"], description="Furnished | Semi-Furnished | Unfurnished")
    transaction: str = Field(..., examples=["Resale"], description="New Property | Resale | Rent/Lease | Other")
    ownership: Optional[str] = Field(None, examples=["Freehold"])
    facing: Optional[str] = Field(None, examples=["East"])


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str
