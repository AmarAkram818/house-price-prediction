interface FormSnapshot {
  location: string;
  carpetAreaSqft: string;
  floorNum: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
}

interface PreviewCardProps {
  price: number | null;
  form?: FormSnapshot;
}

function formatInr(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} Lac`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PreviewCard({ price, form }: PreviewCardProps) {
  if (price === null || !form) {
    return (
      <>
        <div className="preview-hero">
          <span className="preview-hero-icon">🏠</span>
        </div>
        <div className="preview-empty">
          Fill in the property details on the left — your estimated valuation
          will appear here as a listing preview.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="preview-hero">
        <span className="preview-hero-icon">🏠</span>
        <span className="preview-badge">Model estimate</span>
      </div>
      <div className="preview-body">
        <div className="preview-title-row">
          <div className="preview-title">
            {form.furnishing} · {form.transaction}
          </div>
          <div className="preview-price">{formatInr(price)}</div>
        </div>
        <div className="preview-stars">
          ★★★★☆ <span>based on 174K+ comparable listings</span>
        </div>
        <div className="preview-location">📍 {form.location}</div>

        <div className="preview-section-label">Details</div>
        <div className="preview-feature-list">
          <span className="preview-feature">
            📐 <strong>{form.carpetAreaSqft} sqft</strong>
          </span>
          <span className="preview-feature">
            🏢 Floor <strong>{form.floorNum}</strong>
          </span>
          <span className="preview-feature">
            🛁 <strong>{form.bathroom}</strong> bath
          </span>
          <span className="preview-feature">
            🌤️ <strong>{form.balcony}</strong> balcony
          </span>
        </div>

        <button className="preview-cta" type="button">
          ≈ ₹{Math.round(price).toLocaleString("en-IN")}
        </button>
        <div className="disclaimer">
          Estimated by a HistGradientBoosting model (R² ≈ 0.90). Not a formal
          appraisal — actual sale prices vary.
        </div>
      </div>
    </>
  );
}
