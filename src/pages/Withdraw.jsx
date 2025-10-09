import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import "../styles/Withdraw.css";
import { useUser } from "../UserContext";

const API_BASE = import.meta.env.VITE_API_BASE || "";

import withdrawIMG from "../assets/withdrawIcon.png";
import refferalsIMG from "../assets/refferalsIcon.png";
import tonusdtIMG from "../assets/tonusdtIcon.png";
import usdtIMG from "../assets/usdtIcon.png";
import walletIMG from "../assets/walletIcon.png";
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
            <div className="mainWithdrawPageContainer">  
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
                        <h2>Обработка депозита может занимать<br/>до нескольких минут</h2>
                    <div class="line-right"></div>
                </div>

                <div class="mainWithdrawContainer">
                    <div class="AmountAndWithdrawContainer">
                        <div class="AmountContainer">
                            <h2>СУММА</h2>
                        </div>
                        <div class="WirthdrawButton">
                            <h2>ВЫВЕСТИ</h2>
                        </div>
                    </div>
                    <div class="AddressWalletContainer">
                        <h2>Укажите адрес кошелька</h2>
                        <div class="AddressWalletNetworkContainer">
                            <h2>TRC20</h2>
                        </div>
                    </div>
                </div>

                <div class="textOrderHistory-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>История заявок на вывод</h2>
                    <div class="line-right"></div>
                </div>

                <div class="mainOrderContainer">
                    <div class="textWithdrawAndAmountContainer">
                        <div class="textWithdrawAndAmountContainerPart1">
                            <h2>ВЫВОД</h2>
                            <div class="textAmountAndLogoContainer">
                                <h2>
                                    <span className="accent">10</span> USDT
                                </h2>
                                <img src={usdtIMG}/>
                            </div>
                        </div>
                        <div class="textWithdrawAndAmountContainerPart2">
                            <h2>в обработке</h2>
                            <div class="lineOrder-right"></div>
                        </div>
                    </div>
                    <div class="infoOrderWalletContainer">
                        <img src={walletIMG}/>
                        <h2>
                            <span className="accent">TFeB3</span>
                            GgLGWHEzK1S2VndNm49Eyajc
                            <span className="accent">dogat</span>
                        </h2>
                    </div>
                    <div class="infoTimeAndDataContainer">
                        <h2>Дата: 08.10.2025г.</h2>
                        <h2>Время: 10:53</h2>
                    </div>
                </div>

                <div class="mainSecondOrderContainer">
                    <div class="textWithdrawAndAmountContainer">
                        <div class="textWithdrawAndAmountContainerPart1">
                            <h2>ВЫВОД</h2>
                            <div class="textAmountAndLogoContainer">
                                <h2>
                                    <span className="accent">10</span> USDT
                                </h2>
                                <img src={usdtIMG}/>
                            </div>
                        </div>
                        <div class="textWithdrawAndAmountContainerPart2">
                            <h2>в обработке</h2>
                            <div class="lineOrder-right"></div>
                        </div>
                    </div>
                    <div class="infoOrderWalletContainer">
                        <img src={walletIMG}/>
                        <h2>
                            <span className="accent">TFeB3</span>
                            GgLGWHEzK1S2VndNm49Eyajc
                            <span className="accent">dogat</span>
                        </h2>
                    </div>
                    <div class="infoTimeAndDataContainer">
                        <h2>Дата: 08.10.2025г.</h2>
                        <h2>Время: 10:53</h2>
                    </div>
                </div>

                <div class="mainLastOrderContainer">
                    <div class="textWithdrawAndAmountContainer">
                        <div class="textWithdrawAndAmountContainerPart1">
                            <h2>ВЫВОД</h2>
                            <div class="textAmountAndLogoContainer">
                                <h2>
                                    <span className="accent">10</span> USDT
                                </h2>
                                <img src={usdtIMG}/>
                            </div>
                        </div>
                        <div class="textWithdrawAndAmountContainerPart2">
                            <h2>в обработке</h2>
                            <div class="lineOrder-right"></div>
                        </div>
                    </div>
                    <div class="infoOrderWalletContainer">
                        <img src={walletIMG}/>
                        <h2>
                            <span className="accent">TFeB3</span>
                            GgLGWHEzK1S2VndNm49Eyajc
                            <span className="accent">dogat</span>
                        </h2>
                    </div>
                    <div class="infoTimeAndDataContainer">
                        <h2>Дата: 08.10.2025г.</h2>
                        <h2>Время: 10:53</h2>
                    </div>
                </div>

                <div className="footerWithdrawContainer">
                    <div className="footerTelegramChannel" onClick={() =>
                        window.Telegram?.WebApp?.openTelegramLink("https://t.me/aimi_traffic")
                    }>
                        <h2>AIMI TRAFFIC</h2>
                        <img src={TelegramIMG}/>
                    </div>
                    <div className="footerSupportButton" onClick={() =>
                        window.Telegram?.WebApp?.openTelegramLink("https://t.me/gostcust")
                    }>
                        <h2>Поддержка 24/7</h2>
                        <img src={SupportIMG} />
                    </div>
                </div>

            </div>
        </div>
    </div>
    
  );
}