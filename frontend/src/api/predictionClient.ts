import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {}

export async function fetchLocations(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/locations`);
  if (!response.ok) {
    throw new ApiError("Could not load the list of locations.");
  }
  return response.json();
}

export async function predictPrice(payload: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new ApiError("Some of the details entered aren't valid. Please check the form and try again.");
    }
    throw new ApiError("The prediction service is unavailable right now. Please try again shortly.");
  }

  return response.json();
}
