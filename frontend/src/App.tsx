import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultPage from "./pages/ResultPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          Estimate
        </div>
        <div className="tagline">house price · India</div>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
