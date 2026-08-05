import { Link, useLocation, Navigate } from "react-router-dom";
import PreviewCard from "../components/PreviewCard";

interface LocationState {
  predictedPrice: number;
  form: {
    location: string;
    carpetAreaSqft: string;
    floorNum: string;
    bathroom: string;
    balcony: string;
    furnishing: string;
    transaction: string;
  };
}

export default function ResultPage() {
  const { state } = useLocation();
  const data = state as LocationState | null;

  if (!data) {
    // Someone navigated here directly without submitting the form.
    return <Navigate to="/" replace />;
  }

  const { predictedPrice, form } = data;

  return (
    <div className="layout">
      <div className="form-pane">
        <div className="intro">
          <span className="eyebrow">Estimate ready</span>
          <h1>Here's what the model thinks</h1>
          <p>
            This figure comes from a gradient-boosting model with ~90% test-set accuracy (R²).
            Actual sale prices vary — use it as a starting point, not a formal appraisal.
          </p>
        </div>
        <Link className="back-link" to="/">
          ← Value another property
        </Link>
      </div>
      <div className="meter-pane">
        <PreviewCard price={predictedPrice} form={form} />
      </div>
    </div>
  );
}
