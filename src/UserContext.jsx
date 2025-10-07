import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // { telegramId, firstName, username, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const tg = window?.Telegram?.WebApp;
        const initData = tg?.initData || "";
        if (!initData) {
          setLoading(false);
          setError("Не найден Telegram.WebApp.initData (запусти мини-апп из Telegram)");
          return;
        }

        const r = await fetch(`${API_BASE}/api/auth/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const data = await r.json();
        if (!r.ok || !data?.ok) throw new Error(data?.error || "Auth failed");

        setUser(data.user); // { telegramId, firstName, username, ... }
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};