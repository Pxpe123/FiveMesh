import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "./app/routes";

export default function App() {
  return (
    <main className="app-shell">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </main>
  );
}
