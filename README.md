# House Price Prediction — End-to-End ML Web App

An end-to-end machine-learning product that predicts Indian residential property
prices: a Jupyter notebook that cleans data and trains a model, a FastAPI backend
that serves it, and a React frontend where a user enters property details and
gets an instant valuation.

## Overview

Trained on ~187,500 real property listings scraped from Indian real-estate
portals ([House Price dataset by Juhi Bhojani, Kaggle](https://www.kaggle.com/datasets/juhibhojani/house-price)),
the model predicts price from location, carpet area, floor, bathrooms, balconies,
furnishing, transaction type, ownership and facing direction.

## Architecture

```
                 ┌─────────────────────┐
 Kaggle CSV ───► │  Jupyter Notebook    │
                 │  clean → EDA →       │
                 │  train → export      │
                 └──────────┬───────────┘
                            │ house_price.pkl + locations.json
                            ▼
                 ┌─────────────────────┐        ┌──────────────────────┐
 User ──form───► │  React + TS (Vite)   │──────► │  FastAPI backend      │
      ◄─result── │  frontend, :5173     │  JSON  │  /predict /health     │
                 └─────────────────────┘  ◄────  │  :8000                │
                                                  └──────────────────────┘
```

## Tech stack

| Layer      | Tech                                                             |
|------------|-------------------------------------------------------------------|
| Modeling   | Python, pandas, scikit-learn (`Pipeline` + `ColumnTransformer`)   |
| Backend    | FastAPI, Pydantic v2, pydantic-settings, uvicorn                 |
| Frontend   | React 18, TypeScript, Vite, react-router-dom                     |
| Packaging  | joblib (`.pkl`), Docker (backend)                                |

## Project structure

```
house-price-project/
├── notebooks/
│   ├── house_price_model.ipynb   # cleaning, EDA, training, export (executed, no errors)
│   ├── house_price.pkl           # exported pipeline (copy also lives in backend/models)
│   ├── locations.json            # allowed location buckets
│   └── data/house_prices.csv     # raw dataset (not committed — see below)
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app, CORS, model loaded at startup (lifespan)
│   │   ├── api/routes/prediction.py    # GET /health, GET /locations, POST /predict
│   │   ├── core/config.py              # Settings from .env (pydantic-settings)
│   │   ├── schemas/prediction.py       # PredictionRequest / PredictionResponse
│   │   ├── services/
│   │   │   ├── preprocessing.py        # request -> one-row DataFrame
│   │   │   └── inference.py            # load .pkl, run predict
│   │   └── utils/logging_config.py
│   ├── models/house_price.pkl
│   ├── tests/test_prediction.py        # 3 passing tests (health, happy path, 422)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/predictionClient.ts     # fetch wrapper, base URL from VITE_API_BASE_URL
│   │   ├── components/PredictionForm.tsx
│   │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
│   │   ├── types/prediction.ts         # TS types mirroring the backend schema
│   │   └── App.tsx                     # routes: / , /result , * (404)
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Dataset

**House Price** by Juhi Bhojani — <https://www.kaggle.com/datasets/juhibhojani/house-price>
(`house_prices.csv`, ~187,500 rows).

Download it yourself before running the notebook:

```bash
pip install kaggle
# Get an API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in ~/.kaggle/ (macOS/Linux) or C:\Users\<you>\.kaggle\ (Windows)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

(Or download manually from the link above and place the CSV in `notebooks/data/`.)

## Running the notebook

```bash
cd notebooks
python -m venv .venv && source .venv/bin/activate   # .venv\Scripts\activate on Windows
pip install jupyter pandas numpy scikit-learn matplotlib seaborn joblib
jupyter notebook house_price_model.ipynb
# Kernel → Restart & Run All
```

This regenerates `house_price.pkl` and `locations.json`. Copy both into
`backend/models/` if you retrain.

## Backend setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

Run tests:

```bash
PYTHONPATH=. pytest tests/ -v
```

### Environment variables (`backend/.env`)

| Variable          | Default                     | Description                                  |
|-------------------|------------------------------|-----------------------------------------------|
| `MODEL_PATH`      | `models/house_price.pkl`    | Path to the trained pipeline                  |
| `LOCATIONS_PATH`  | `models/locations.json`     | Path to the list of allowed location buckets  |
| `CORS_ORIGINS`    | `["http://localhost:5173"]` | Allowed frontend origins                      |
| `LOG_LEVEL`       | `INFO`                       | Logging verbosity                             |

### API reference

**`GET /health`**
```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

**`GET /locations`** — list of location buckets for the frontend dropdown.

**`POST /predict`**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
        "location": "mumbai",
        "carpet_area_sqft": 850,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East"
      }'
# {"predicted_price": 13739777.75}
```

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# open http://localhost:5173
```

### Environment variables (`frontend/.env`)

| Variable              | Default                 | Description                     |
|-----------------------|--------------------------|----------------------------------|
| `VITE_API_BASE_URL`   | `http://localhost:8000` | Base URL of the FastAPI backend |

`npm run build` produces a production bundle in `dist/`.

## Model metrics

Three models were trained and compared on a held-out 20% test set (target:
`log1p(price)`, inverted with `expm1` for reporting in INR):

| Model                 | MAE (₹)     | RMSE (₹)    | R²      |
|------------------------|------------:|------------:|--------:|
| Linear Regression       | very poor — extrapolates badly on outlier combinations | — | negative |
| Random Forest (subsample) | ~1,209,995 | ~4,257,230 | 0.880 |
| **HistGradientBoosting (winner)** | **1,350,905** | **3,786,719** | **0.905** |

`HistGradientBoostingRegressor` was exported as the production model — full
methodology, plots, and commentary are in the notebook.

## Full local demo

1. Start the backend: `cd backend && uvicorn app.main:app --reload` (port 8000)
2. Start the frontend: `cd frontend && npm run dev` (port 5173)
3. Open `http://localhost:5173`, fill in the form, submit, and see the predicted
   price on the result page.

## Notes on this implementation

This project was built end-to-end (notebook executed top-to-bottom with no
errors, backend tests passing, frontend building and running against a live
backend) in a sandboxed single-core environment, which is why the notebook trains
`RandomForestRegressor` on a subsample and relies on `HistGradientBoostingRegressor`
(much faster on CPU) as the full-dataset model — this trade-off is explained in
the notebook itself. Before publishing, verify the whole flow yourself on your
own machine, and add screenshots of the running app to this README as required
by the assignment.
