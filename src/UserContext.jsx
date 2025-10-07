import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { telegramId, username, firstName, lastName, photoUrl }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tgIdRef = useRef(null);

  const refetchUser = async () => {
    if (!tgIdRef.current) return;
    const r = await fetch(`${API_BASE}/get-user?telegramId=${tgIdRef.current}&t=${Date.now()}`, {
      cache: "no-store",
    });
    const data = await r.json();
    if (data?.ok) setUser(data.user);
  };

  const updateUser = (patch) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...(patch || {}) };
      // аккуратно объединяем tasks
      if (prev?.tasks || patch?.tasks) {
        next.tasks = { ...(prev?.tasks || {}), ...(patch?.tasks || {}) };
      }
      return next;
    });
  };


  useEffect(() => {
    (async () => {
      try {
        const tg = window?.Telegram?.WebApp;
        const u  = tg?.initDataUnsafe?.user;     // ← источник правды в мини-аппе
        const payload = {
          telegramId: u?.id?.toString(),
          username:   u?.username || null,
          firstName:  u?.first_name || null,
          lastName:   u?.last_name || null,
          photoUrl:   u?.photo_url || null
        };

        if (!payload.telegramId) {
          setLoading(false);
          setError("Нет Telegram.WebApp.user (запусти из Telegram)");
          return;
        }

        const r = await fetch(`${API_BASE}/register-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (!r.ok || !data?.ok) throw new Error(data?.error || "Auth failed");

        setUser(data.user);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};