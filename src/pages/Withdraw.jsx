import React, { useEffect, useState, useRef } from "react";

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

function sanitizeAddress(raw = "") {
  return String(raw)
    .replace(/[\s\u200B-\u200D\uFEFF]/g, "")   // убираем пробелы/zero-width
    .replace(/[^\x00-\x7F]/g, "");            // только ASCII
}
function isTronAddress(s) {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(s); // T + 33 base58 = 34
}

export default function Withdraw() {

    const navigate = useNavigate();

    const { user, loading, refetchUser, updateUser } = useUser();

    const AMOUNT_LABEL = "СУММА";
    const [amount, setAmount] = useState(AMOUNT_LABEL);

    const addrRef = useRef(null);
    const [walletAddress, setWalletAddress] = useState("Укажите адрес кошелька");
    const [isAddressNeutral, setIsAddressNeutral] = useState(true);
    const addrClean = sanitizeAddress(isAddressNeutral ? "" : walletAddress);
    const addressValid = !isAddressNeutral && isTronAddress(addrClean);



    useEffect(() => {
        const el = addrRef.current;
        if (!el) return;
        if (isAddressNeutral) {
            el.textContent = "Укажите адрес кошелька";
        }
    }, [isAddressNeutral]);


    const moveCursorToEnd = (el) => {
        try {
        const r = document.createRange();
        const s = window.getSelection();
        r.selectNodeContents(el);
        r.collapse(false);
        s.removeAllRanges();
        s.addRange(r);
        } catch {}
    };

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
                            <h2
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                spellCheck={false}
                                inputMode="numeric" 
                                enterKeyHint="done" 
                                onFocus={(e) => {
                                    if (amount === AMOUNT_LABEL) {
                                    setAmount("");
                                    e.currentTarget.textContent = "";
                                    }
                                    moveCursorToEnd(e.currentTarget);
                                }}
                                onInput={(e) => {
                                    const raw = e.currentTarget.textContent || "";
                                    const digits = raw.replace(/[^0-9]/g, ""); // только целые
                                    setAmount(digits);
                                    e.currentTarget.textContent = digits;
                                    moveCursorToEnd(e.currentTarget);
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = (e.clipboardData || window.clipboardData).getData("text");
                                    const digits = String(text).replace(/[^0-9]/g, "");
                                    setAmount(digits);
                                    document.execCommand("insertText", false, digits);
                                }}
                                onBlur={(e) => {
                                    if (!amount) {
                                    setAmount(AMOUNT_LABEL);
                                    e.currentTarget.textContent = AMOUNT_LABEL;
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                    }
                                }}
                                >
                                {amount}
                            </h2>
                        </div>
                        <div class="WirthdrawButton">
                            <h2>ВЫВЕСТИ</h2>
                        </div>
                    </div>
                    <div className={`AddressWalletContainer ${isAddressNeutral ? "" : (addressValid ? "valid" : "invalid")}`}>
<div
  ref={addrRef}
  className={`addressInput ${isAddressNeutral ? "is-placeholder" : ""}`}
  contentEditable
  suppressContentEditableWarning
  spellCheck={false}
  onFocus={(e) => {
    if (isAddressNeutral) {
      e.currentTarget.textContent = "";
      setWalletAddress("");
      setIsAddressNeutral(false);
    }
    // курсор в конец
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(e.currentTarget);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }}
  onInput={(e) => {
    const el = e.currentTarget;
    const raw = el.textContent || "";
    let next = sanitizeAddress(raw);

    // 1) Первая буква обязана быть 'T' (латиница). Иначе — сброс + закрыть клавиатуру.
    if (next && next[0] !== "T") {
      el.blur();
      el.textContent = "Укажите адрес кошелька";
      setWalletAddress("Укажите адрес кошелька");
      setIsAddressNeutral(true);
      return;
    }

    // 2) Жёсткий лимит 34 символа
    if (next.length > 34) next = next.slice(0, 34);

    // Если изменили — вернуть текст и каретку в конец
    if (next !== raw) {
      el.textContent = next;
      const sel = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    setWalletAddress(next);
  }}
  onPaste={(e) => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData("text") || "";
    let cleaned = sanitizeAddress(txt);

    // первая буква обязана быть 'T'
    if (cleaned && cleaned[0] !== "T") {
      const el = e.currentTarget;
      el.blur();
      el.textContent = "Укажите адрес кошелька";
      setWalletAddress("Укажите адрес кошелька");
      setIsAddressNeutral(true);
      return;
    }

    // лимит 34 символа
    if (cleaned.length > 34) cleaned = cleaned.slice(0, 34);

    setWalletAddress(cleaned);
    document.execCommand("insertText", false, cleaned);

    // курсор в конец
    const el = e.currentTarget;
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
  }}
  onBlur={(e) => {
    if (!sanitizeAddress(e.currentTarget.textContent || "")) {
      e.currentTarget.textContent = "Укажите адрес кошелька";
      setWalletAddress("Укажите адрес кошелька");
      setIsAddressNeutral(true);
    }
  }}
/>
                    <div className="AddressWalletNetworkContainer">
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