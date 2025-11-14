import { useEffect, useState } from "react";

const TADDY_SRC = "https://sdk.taddy.pro/web/taddy.min.js";

function ensureTaddyScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window unavailable (SSR)"));
  }
  if (window.Taddy) return Promise.resolve(window.Taddy);

  const existing = Array.from(document.scripts).find((s) => s.src === TADDY_SRC);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.Taddy));
      existing.addEventListener("error", () => reject(new Error("Failed to load Taddy script")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TADDY_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(window.Taddy));
    script.addEventListener("error", () => reject(new Error("Failed to load Taddy script")));
    document.head.appendChild(script);
  });
}

async function initTaddy(pubId) {
  const taddy = await ensureTaddyScript();
  if (!taddy._initialized) {
    taddy.init(pubId);
    taddy._initialized = true;
  }
  if (typeof taddy.ready === "function") {
    taddy.ready();
  }
  return taddy;
}

export function useTaddy(pubId) {
  const [taddy, setTaddy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    initTaddy(pubId)
      .then((inst) => {
        if (!alive) return;
        setTaddy(inst);
        setError(null);
      })
      .catch((e) => alive && setError(e?.message || "Failed to init Taddy"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [pubId]);

  return { taddy, loading, error };
}