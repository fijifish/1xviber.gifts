// useTaddyProgress.js
import { useEffect, useState, useCallback, useMemo } from "react";

const API = import.meta.env.VITE_API_BASE; 

function getTgId() {
  return (
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() ||
    new URLSearchParams(location.search).get("userId") ||
    ""
  );
}

export default function useTaddyProgress() {
  const [loading, setLoading] = useState(true);
  const [exchangeDone, setExchangeDone] = useState(() => new Set());
  const [interstitialDone, setInterstitialDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/taddy/completed`, {
          headers: { "x-telegram-id": getTgId() },
        });
        const data = r.ok ? await r.json() : { exchangeIds: [], interstitialDone: false };
        setExchangeDone(new Set(data.exchangeIds || []));
        setInterstitialDone(!!data.interstitialDone);
      } catch {
        setExchangeDone(new Set());
    
        setInterstitialDone(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markCompleted = useCallback(async (kind, itemId, amountTon = 0.3) => {
    const r = await fetch(`${API}/api/taddy/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-id": getTgId(),
      },
      body: JSON.stringify({ kind, itemId, amountTon }),
    });

    const data = await r.json();

    // локальный прогресс
    if (kind === "exchange" && itemId) {
      setExchangeDone(prev => new Set(prev).add(itemId));
    }
    if (kind === "interstitial") {
      setInterstitialDone(true);
    }

    // мгновенное обновление баланса в UI
    if (typeof data?.balance === "number") {
      localStorage.setItem("onex:balance", String(data.balance));
      window.dispatchEvent(new CustomEvent("balance:update", { detail: data.balance }));
    }

    return data;
  }, []);

  const isExchangeDone = useCallback((id) => exchangeDone.has(id), [exchangeDone]);
  const exchangeDoneIds = useMemo(() => Array.from(exchangeDone), [exchangeDone]);

  return { loading, interstitialDone, isExchangeDone, exchangeDoneIds, markCompleted };
}