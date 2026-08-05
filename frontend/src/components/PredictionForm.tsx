import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import locations from "../locations.json";
import { predictPrice, ApiError } from "../api/predictionClient";
import {
  FURNISHING_OPTIONS,
  TRANSACTION_OPTIONS,
  OWNERSHIP_OPTIONS,
  FACING_OPTIONS,
} from "../types/prediction";

interface FormState {
  location: string;
  carpetAreaSqft: string;
  floorNum: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

const initialState: FormState = {
  location: locations[0] ?? "",
  carpetAreaSqft: "",
  floorNum: "",
  bathroom: "",
  balcony: "",
  furnishing: FURNISHING_OPTIONS[1],
  transaction: TRANSACTION_OPTIONS[1],
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function PredictionForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): Errors {
    const next: Errors = {};
    const area = Number(form.carpetAreaSqft);
    const floor = Number(form.floorNum);
    const bathroom = Number(form.bathroom);
    const balcony = Number(form.balcony);

    if (!form.location) next.location = "Choose a location.";
    if (!form.carpetAreaSqft || Number.isNaN(area) || area <= 0) {
      next.carpetAreaSqft = "Enter a carpet area greater than 0.";
    }
    if (form.floorNum === "" || Number.isNaN(floor)) next.floorNum = "Enter the floor number.";
    if (form.bathroom === "" || Number.isNaN(bathroom) || bathroom < 0) {
      next.bathroom = "Enter the number of bathrooms.";
    }
    if (form.balcony === "" || Number.isNaN(balcony) || balcony < 0) {
      next.balcony = "Enter the number of balconies.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setApiError(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    try {
      const result = await predictPrice({
        location: form.location,
        carpet_area_sqft: Number(form.carpetAreaSqft),
        floor_num: Number(form.floorNum),
        bathroom: Number(form.bathroom),
        balcony: Number(form.balcony),
        furnishing: form.furnishing,
        transaction: form.transaction,
        ownership: form.ownership,
        facing: form.facing,
      });
      navigate("/result", { state: { predictedPrice: result.predicted_price, form } });
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const topCities = (locations as string[]).slice(0, 8);

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="field span-2">
        <label>Popular cities</label>
        <div className="city-picks">
          {topCities.map((loc) => (
            <button
              key={loc}
              type="button"
              className={`city-pill ${form.location === loc ? "active" : ""}`}
              onClick={() => update("location", loc)}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="field span-2">
        <label htmlFor="location">Location</label>
        <select id="location" value={form.location} onChange={(e) => update("location", e.target.value)}>
          {locations.map((loc: string) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <span className="field-error">{errors.location}</span>
      </div>

      <div className="field">
        <label htmlFor="carpetArea">Carpet area (sqft)</label>
        <input
          id="carpetArea"
          type="number"
          min={1}
          placeholder="e.g. 850"
          value={form.carpetAreaSqft}
          onChange={(e) => update("carpetAreaSqft", e.target.value)}
        />
        <span className="field-error">{errors.carpetAreaSqft}</span>
      </div>

      <div className="field">
        <label htmlFor="floor">Floor number</label>
        <input
          id="floor"
          type="number"
          placeholder="0 = ground, -1 = basement"
          value={form.floorNum}
          onChange={(e) => update("floorNum", e.target.value)}
        />
        <span className="field-error">{errors.floorNum}</span>
      </div>

      <div className="field">
        <label htmlFor="bathroom">Bathrooms</label>
        <input
          id="bathroom"
          type="number"
          min={0}
          placeholder="e.g. 2"
          value={form.bathroom}
          onChange={(e) => update("bathroom", e.target.value)}
        />
        <span className="field-error">{errors.bathroom}</span>
      </div>

      <div className="field">
        <label htmlFor="balcony">Balconies</label>
        <input
          id="balcony"
          type="number"
          min={0}
          placeholder="e.g. 1"
          value={form.balcony}
          onChange={(e) => update("balcony", e.target.value)}
        />
        <span className="field-error">{errors.balcony}</span>
      </div>

      <div className="field">
        <label htmlFor="furnishing">Furnishing</label>
        <select id="furnishing" value={form.furnishing} onChange={(e) => update("furnishing", e.target.value)}>
          {FURNISHING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction">Transaction type</label>
        <select id="transaction" value={form.transaction} onChange={(e) => update("transaction", e.target.value)}>
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ownership">Ownership</label>
        <select id="ownership" value={form.ownership} onChange={(e) => update("ownership", e.target.value)}>
          {OWNERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="facing">Facing</label>
        <select id="facing" value={form.facing} onChange={(e) => update("facing", e.target.value)}>
          {FACING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field span-2">
        <div className="submit-row">
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Valuing…" : "Get valuation"}
          </button>
          <span className="submit-hint">Takes about a second — no sign-up needed.</span>
        </div>
        {apiError && <div className="api-error">{apiError}</div>}
      </div>
    </form>
  );
}
