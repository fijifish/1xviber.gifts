import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [balance, setBalance] = useState({ ton: "0", onex: "0" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const getRefFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref"); // 👈 берём ?ref=... если есть
  };

  const fetchUserData = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id;
      const username = tg?.initDataUnsafe?.user?.username || null;
      const ref = getRefFromUrl(); // ✅

      if (telegramId) {
        console.log("✅ `userId` из Telegram.WebApp:", telegramId);
        setUserId(telegramId);
        setUsername(username);
        await registerUser(telegramId, username, ref);
        return;
      }

      console.log("🔄 `userId` не найден в WebApp, загружаем с сервера...");
      const response = await fetch("https://1xback-production-25cd.up.railway.app/get-user", {
        headers: { "x-telegram-id": telegramId ? telegramId.toString() : "" }
      });

      const data = await response.json();
      if (response.ok && data.userId) {
        setUserId(data.userId);
        setUsername(data.username || null);
      } else {
        console.error("❌ Ошибка: userId отсутствует в ответе сервера!");
      }

      console.warn("⚠️ `Telegram.WebApp` не найден, используем фейковый userId для теста!");
    
      const fakeUserId = "123456789"; // 👉 любой тестовый ID
      const fakeUsername = "testuser";
  
      setUserId(fakeUserId);
      setUsername(fakeUsername);
      await registerUser(fakeUserId, fakeUsername, ref);
      
    } catch (error) {
      console.error("❌ Ошибка при получении userId:", error);
    }
  };

  const registerUser = async (telegramId, username, ref) => {
    try {
      console.log("📌 Отправка `telegramId` на сервер:", telegramId);
      const response = await fetch("https://1xback-production-25cd.up.railway.app/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId, username, ref })
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Пользователь зарегистрирован или уже существует:", data);
      } else {
        console.error("❌ Ошибка при регистрации:", data.error);
      }
    } catch (error) {
      console.error("❌ Ошибка при отправке `telegramId` на сервер:", error);
    }
  };

  const fetchBalance = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`https://1xback-production-25cd.up.railway.app/get-balance?userId=${id}`);
      const data = await response.json();
      if (response.ok && data.balance !== undefined) {
        setBalance({
          ton: parseFloat(data.balance),
          onex: parseFloat(data.onexBalance || 0)
        });
      }
    } catch (error) {
      console.error("❌ Ошибка при получении баланса:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchBalance(userId);
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, username, balance, fetchBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);