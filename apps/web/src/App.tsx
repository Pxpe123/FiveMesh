import { BrowserRouter, HashRouter } from "react-router-dom";

import { AppRoutes } from "./app/routes";

export default function App() {
  const Router =
    import.meta.env.VITE_STATIC_MODE === "true" ? HashRouter : BrowserRouter;

  return (
    <main className="app-shell">
      <Router>
        <AppRoutes />
      </Router>
    </main>
  );
}
