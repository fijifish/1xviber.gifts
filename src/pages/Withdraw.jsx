import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import "../styles/Withdraw.css";
import { useUser } from "../UserContext";

const API_BASE = import.meta.env.VITE_API_BASE || "";

import withdrawIMG from "../assets/withdrawIcon.png";
import refferalsIMG from "../assets/refferalsIcon.png";
import tonusdtIMG from "../assets/tonusdtIcon.png";
import channelIMG from "../assets/channelIcon.png";
import usersIMG from "../assets/usersIcon.png";
import OneWinIMG from "../assets/OneWinIcon.png";
import JettonIMG from "../assets/JettonIcon.png";
import MostbetIMG from "../assets/MostbetIcon.png";
import TelegramIMG from "../assets/telegramIcon.png";
import SupportIMG from "../assets/supportIcon.png";

export default function Withdraw() {

    const navigate = useNavigate();

    const { user, loading, refetchUser, updateUser } = useUser();

    const [tonToUsdRate, setTonToUsdRate] = useState(null); // how many USDT for 1 TON

    useEffect(() => {
      const fetchTonToUsdRate = async () => {
        try {
          const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT");
          if (!response.ok) throw new Error(`Binance error: ${response.status}`);
          const data = await response.json();
          if (data && data.price) setTonToUsdRate(parseFloat(data.price));
        } catch (e) {
          console.error("TON/USDT rate fetch failed:", e);
        }
      };
      fetchTonToUsdRate();
    }, []);

    const usdToTon = (usd) => (tonToUsdRate ? Number(usd) / tonToUsdRate : 0);

    const usdtBalance = Number(user?.balanceTon ?? 0); // ⚠️ сейчас тут хранится именно USDT
    const tonBalance  = usdToTon(usdtBalance);

    const [taskDone, setTaskDone] = useState(Boolean(user?.tasks?.channelSubscribed));

    // если пришёл свежий user из контекста — обновим локальный стейт
    useEffect(() => {
    setTaskDone(Boolean(user?.tasks?.channelSubscribed));
    }, [user?.tasks?.channelSubscribed]);

    const telegramId  = user?.telegramId;
    const displayName = user?.firstName || user?.username || (telegramId ? `id${telegramId}` : "User");
    const displayUsername = user?.username ? `@${user.username}` : (telegramId ? `id${telegramId}` : "");
    const initials = (user?.firstName || user?.username || String(telegramId || "U"))
    .slice(0,2)
    .toUpperCase();

    useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    const onBack = () => {
        
        navigate(-1);

    };

    tg?.BackButton?.show();
    tg?.BackButton?.onClick(onBack);

    return () => {
        tg?.BackButton?.offClick(onBack);
        tg?.BackButton?.hide();
    };
    }, [navigate]);

  return (
    <div className="App">
        <div className="Main_Window">   
            <div className="mainHomePageContainer">  
                <div className="headerContainer">
                    <div className="circleInHeaderContainer">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} className="userAvatar"/>
                        ) : (
                            <div className="circleName">
                                {loading ? "" : initials}
                            </div>
                        )}
                    </div>
                    <div className="nickNameContainer">
                        <div className="nickNameContainerPart1">{loading ? "Загрузка" : displayName}</div>
                        <div className="nickNameContainerPart2">{loading ? "" : displayUsername}</div>
                    </div>
                    <div className="mainBalanceContainer">
                        <img src={tonusdtIMG}/>
                        <h2>{tonToUsdRate ? tonBalance.toFixed(2) : "…"} TON | {usdtBalance} USDT</h2> 
                    </div>
                    <div className="withdrawContainer" onClick={() => navigate("/withdraw")} role="button">
                        <img src={withdrawIMG} alt="withdraw" />
                    </div>
                    <div className="refferalsContainer">
                        <img src={refferalsIMG}/>
                    </div>
                </div>

                <div class="textWithdraw-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>
                            Обработка депозита может занимать<br/>
                            до нескольких минут.
                        </h2>
                    <div class="line-right"></div>
                </div>

                <div class="mainWithdrawContainer">
                    <div class="AmountAndWithdrawContainer">
                        <div class="AmountContainer">

                        </div>
                        <div class="WirthdrawButton">

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    
  );
}