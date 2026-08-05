import PredictionForm from "../components/PredictionForm";
import PreviewCard from "../components/PreviewCard";

export default function HomePage() {
  return (
    <div className="layout">
      <div className="form-pane">
        <div className="intro">
          <span className="eyebrow">174,000+ listings · India</span>
          <h1>What's this property actually worth?</h1>
          <p>
            Enter the details below and a gradient-boosted model estimates the market price
            in seconds — trained on real listings across 30+ Indian cities.
          </p>
        </div>
        <PredictionForm />
      </div>
      <div className="meter-pane">
        <PreviewCard price={null} />
      </div>
    </div>
  );
}
