import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>There's no page here. Maybe it moved, maybe it never existed.</p>
      <Link className="back-link" to="/">
        ← Back to the estimator
      </Link>
    </div>
  );
}
