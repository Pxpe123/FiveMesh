import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { apiUrl } from "../api/apiBase";

type BackendStatus = "checking" | "online" | "offline";

export function BackendStatusBanner() {
  const location = useLocation();
  const isStaticBuild = import.meta.env.VITE_STATIC_MODE === "true";
  const [status, setStatus] = useState<BackendStatus>(
    isStaticBuild ? "offline" : "checking",
  );

  useEffect(() => {
    if (isStaticBuild) return;

    let active = true;
    const check = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 3500);
      try {
        const response = await fetch(apiUrl("/api/health"), {
          signal: controller.signal,
          cache: "no-store",
        });
        if (active) setStatus(response.ok ? "online" : "offline");
      } catch {
        if (active) setStatus("offline");
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void check();
    const interval = window.setInterval(check, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isStaticBuild]);

  if (
    status !== "offline" ||
    location.pathname === "/games/hack-practice"
  ) {
    return null;
  }

  return (
    <aside className="backend-status-banner" role="status">
      <div>
        <strong>Asset tools are currently offline</strong>
        <span>
          The Server and Engine are not connected, but the practice games work
          entirely in your browser.
        </span>
      </div>
      <Link to="/games/hack-practice">Play ATM Bomb Hack Practice</Link>
    </aside>
  );
}
