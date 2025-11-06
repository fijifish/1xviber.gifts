import React, { useEffect, useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import "../styles/Withdraw.css";
import { useUser } from "../UserContext";

export const API_BASE = import.meta.env.VITE_API_BASE || "";

import withdrawIMG from "../assets/withdrawIcon.png";
import refferalsIMG from "../assets/refferalsIcon.png";
import tonusdtIMG from "../assets/tonusdtIcon.png";
import usdtIMG from "../assets/usdtIcon.png";
import walletIMG from "../assets/walletIcon.png";
import TelegramIMG from "../assets/telegramIcon.png";
import SupportIMG from "../assets/supportIcon.png";
import PasteIMG from "../assets/paste-icon.png";
import InfoIMG from "../assets/info-icon.png";
import polygonIMG from "../assets/polygonIMG.png";
import cardIMG from "../assets/cardIMG.png";
import polygonGrayIMG from "../assets/polygonGrayIMG.png";
import cardGrayIMG from "../assets/cardGrayIMG.png";
import paymethodIMG from "../assets/paymethodIMG.png";
import cryptoIMG from "../assets/cryptoIMG.png";



function sanitizeAddress(raw = "") {
  return String(raw)
    .replace(/[\s\u200B-\u200D\uFEFF]/g, "")   // убираем пробелы/zero-width
    .replace(/[^\x00-\x7F]/g, "");            // только ASCII
}
// NOTE: Валидация TRC20 отключена по задаче. Оставляем заглушку на будущее.
function isTronAddress(_s) {
  return true;
}

export default function Withdraw() {

    const navigate = useNavigate();

    const { user, loading, refetchUser, updateUser } = useUser();

    const AMOUNT_LABEL = "СУММА";
    const [amount, setAmount] = useState(AMOUNT_LABEL);

    const addrRef = useRef(null);
    const [walletAddress, setWalletAddress] = useState("Кошелёк TON или реквизиты");
    const [isAddressNeutral, setIsAddressNeutral] = useState(true);
    const addrClean = sanitizeAddress(isAddressNeutral ? "" : walletAddress);
    const addressValid = !isAddressNeutral && addrClean.length > 0; // валидно, если поле не пустое



    useEffect(() => {
        const el = addrRef.current;
        if (!el) return;
        if (isAddressNeutral) {
            el.textContent = "Кошелёк TON или реквизиты";
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

    function usdToTon(usd) { return tonToUsdRate ? Number(usd) / tonToUsdRate : 0; }

    // ===== Balances hooks (moved here to ensure usdToTon is defined) =====
    const [usdAvailable, setUsdAvailable] = useState(0);
    const [usdLocked, setUsdLocked] = useState(0);

    const availableTON = usdToTon(usdAvailable);
    const lockedTON    = usdToTon(usdLocked);

    const totalUSD = usdAvailable + usdLocked;
    const totalTON = usdToTon(totalUSD);

    useEffect(() => {
      if (!user?.telegramId || !API_BASE) return;
      fetch(`${API_BASE}/balances?telegramId=${user.telegramId}`)
        .then(r => r.json())
        .then(d => {
          if (d?.ok) {
            setUsdAvailable(Number(d.usdAvailable || 0));
            setUsdLocked(Number(d.usdLocked || 0));
          }
        })
        .catch(console.error);
    }, [user?.telegramId]);

    const usdtBalance = Number(user?.balanceTon ?? 0); // ⚠️ сейчас тут хранится именно USDT
    const tonBalance  = usdToTon(usdtBalance);

    const amountValid = amount && amount !== AMOUNT_LABEL && Number(amount) > 0;
    const readyToWithdraw = amountValid && addressValid;

    const telegramId  = user?.telegramId;
    const displayName = user?.firstName || user?.username || (telegramId ? `id${telegramId}` : "User");
    const displayUsername = user?.username ? `@${user.username}` : (telegramId ? `id${telegramId}` : "");
    const initials = (user?.firstName || user?.username || String(telegramId || "U"))
    .slice(0,2)
    .toUpperCase();

    const [orders, setOrders] = React.useState([]);

    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getOrderClass = (i, len) => {
        if (len === 1) return "mainOrderContainer";             // единственная
        if (i === 0)     return "mainOrderContainer";            // первая
        if (i === len-1) return "mainLastOrderContainer";        // последняя
    return "mainSecondOrderContainer";                   
    };


    // при монтировании — подтянуть из бэка
    useEffect(() => {
    if (!telegramId) return;
    fetch(`${API_BASE}/withdraw/list?telegramId=${telegramId}`)
        .then(r => r.json())
        .then(d => { if (d.ok) setOrders(d.orders || []); })
        .catch(console.error);
    }, [telegramId]);

    const handleCreateWithdraw = async () => {

    if (!readyToWithdraw) return;

    // ✅ Проверка доступного баланса
    if (Number(amount) > usdAvailable) {
        alert("⚠️ Недостаточно средств для вывода. Проверьте сумму.");
        return;
    }

    try {
        const r = await fetch(`${API_BASE}/withdraw/create`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            telegramId: telegramId,          // твой userId/telegramId
            amount: Number(amount),      // сумма в USDT
            address: addrClean           // TRC20 адрес
        })
        });
        const d = await r.json();
        if (!r.ok || !d.ok) throw new Error(d.error || "Server error");

        // оптимистично добавим сверху
        setOrders(prev => [d.order, ...prev]);

        // сброс полей
        setAmount(AMOUNT_LABEL);         // твой плейсхолдер суммы
      
        const el = addrRef.current;
        if (el) el.textContent = "Кошелёк TON или реквизиты";
        setWalletAddress("");
        setIsAddressNeutral(true);
    } catch (e) {
        console.error("Create withdraw error:", e);
        alert("Не удалось создать заявку: " + e.message);
    }
    };

    const fmtDate = (iso) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth()+1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}г.`;
        };

        const fmtTime = (iso) => {
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${min}`;
        };

        // Подсветка первых/последних 5 символов
        const renderAddressWithEdges = (s, n = 5) => {
        s = String(s || "");
        if (!s) return null;
        if (s.length <= n*2) return <span className="accent">{s}</span>;
        return (
            <>
            <span className="accent">{s.slice(0, n)}</span>
            {s.slice(n, -n)}
            <span className="accent">{s.slice(-n)}</span>
            </>
        );
    };

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

    function Dropdown({
        wrapperClass = "",   // ⬅️ добавили
        className,           // .bankInfoContainer / .payMethodContainer (кнопка)
        staticLabel,
        leftIcon,
        rightIcon,
        value,
        options,
        onChange,
        }) {
        const [open, setOpen] = useState(false);
        const rootRef = useRef(null);

        // клик вне — закрыть
        useEffect(() => {
            function onDoc(e) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
            }
            document.addEventListener("mousedown", onDoc);
            return () => document.removeEventListener("mousedown", onDoc);
        }, []);

        const selected = options.find(o => o.value === value);
        const currentLabel = selected?.label || staticLabel;
        const iconToShow = (selected?.icon || leftIcon);

        return (
            <div ref={rootRef} className={`dropdown ${wrapperClass} ${open ? "open" : ""}`}>
                <button
                    type="button"
                    className={`${className} dropdown__button`}
                    onClick={() => setOpen(v => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    {iconToShow && (
                        <img
                            src={iconToShow}
                            className="first-child"
                            alt=""
                            style={{ height: selected?.iconHeight || "auto" }}
                        />
                    )}

                    <h2>{currentLabel}</h2>

                    {rightIcon && <img src={rightIcon} className="last-child" alt="" />}
                </button>

                <ul className="dropdown__menu" role="listbox">
                {options
                    .filter(o => o.value !== value) // 🟢 исключаем выбранный пункт
                    .map(o => (
                    <li
                        key={o.value}
                        role="option"
                        aria-selected={false}
                        className="dropdown__item"
                        onClick={() => { onChange(o.value); setOpen(false); }}
                    >
                        <span>{o.label}</span>
                    </li>
                    ))}
                </ul>
            </div>
        );
    }

    const TYPE_OPTIONS = [
        { value: "crypto", label: "Крипто", icon: cryptoIMG, iconHeight: "55%" },
        { value: "bank", label: "Реквизиты", icon: cardIMG },
    ];

    const METHOD_OPTIONS = [
        { value: "paymethod", label: "Способ оплаты", icon: null },
        { value: "sber",      label: "Сбербанк",       icon: null },
        { value: "tinkoff",   label: "Тинькофф",       icon: null },
        { value: "yoom",      label: "ЮMoney",         icon: null },
        { value: "usdt",      label: "USDT (TRC20)",   icon: usdtIMG },
        { value: "ton",       label: "TON",            icon: tonusdtIMG },
    ];

    const [payType, setPayType]     = useState("bank");  // "Реквизиты" по умолчанию
    const [payMethod, setPayMethod] = useState("paymethod");

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
                        <h2>{tonToUsdRate ? totalTON.toFixed(2) : "…"} TON | {totalUSD.toFixed(2)} USDT</h2> 
                    </div>
                    <div className="withdrawContainer" onClick={() => navigate("/withdraw")} role="button">
                        <img src={withdrawIMG} alt="withdraw" />
                    </div>
                    <div className="refferalsContainer">
                        <img src={refferalsIMG}/>
                    </div>
                </div>

                <div class="mainAllBalanceContainer">
                    <div className="AvaliableBalanceContainer">
                        <h2>Доступный баланс</h2> 
                        <div className="secondAvaliableBalanceContainer">
                            <img src={tonusdtIMG}/>
                            <h2>{availableTON ? availableTON.toFixed(2) : "…"} TON | {usdAvailable.toFixed(2)} USDT</h2>
                        </div>
                    </div>
                    <div className="LockedBalanceContainer">
                        <h2>Заблокированный остаток</h2> 
                        <div className="secondLockedBalanceContainer">
                            <img src={tonusdtIMG}/>
                            <h2>{lockedTON ? lockedTON.toFixed(2) : "…"} TON | {usdLocked.toFixed(2)} USDT</h2>
                        </div>
                    </div>
                    <div className="infoAvaliableBalanceContainer">
                        <img src={InfoIMG}/>
                        <h2>Доступный баланс - это баланс, который до- <br />ступен к выводу в данный момент временни.</h2>
                    </div>
                    <div className="infoLockedBalanceContainer">
                        <img src={InfoIMG}/>
                        <h2>Заблокированный остаток — это часть<br />
                            средств, которая станет доступна после<br />
                            выполнения всех представленных заданий.
                        </h2>
                        
                    </div>
                </div>

                <div class="textWithdraw-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>Обработка депозита может занимать<br/>до нескольких минут</h2>
                    <div class="line-right"></div>
                </div>

                <div class="mainWithdrawContainer">
                    <div class="bankInfoAndPayMethodContainer">
                        {/* <div class="bankInfoContainer">
                            <img src={cardIMG} className="first-child"/>
                                <h2>Реквизиты</h2>
                            <img src={polygonIMG} className="last-child"/>
                        </div> */}
                        <Dropdown
                            wrapperClass="dropdown--type"      // ⬅️ модификатор для ширины «Тип»
                            className="bankInfoContainer"
                            staticLabel="Реквизиты"
                            leftIcon={cardIMG}
                            rightIcon={polygonIMG}
                            value={payType}
                            options={TYPE_OPTIONS}
                            onChange={setPayType}
                        />

                        <Dropdown
                            wrapperClass="dropdown--method"    // ⬅️ модификатор для ширины «Метод»
                            className="payMethodContainer"
                            staticLabel="Способ оплаты"
                            leftIcon={paymethodIMG}
                            rightIcon={polygonGrayIMG}
                            value={payMethod}
                            options={METHOD_OPTIONS}
                            onChange={setPayMethod}
                        />
                        {/* <div class="payMethodContainer">
                            <img src={cardGrayIMG} className="first-child"/>
                                <h2>Способ оплаты</h2>
                            <img src={polygonGrayIMG} className="last-child"/>
                        </div> */}
                    </div>
                    <div class="descriptionBankInfoContainer">
                        <img src={InfoIMG}/>
                        <h2>Реквизиты - способ оплаты на банковский счёт.</h2>
                    </div>
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

                        <div
                        className={`WirthdrawButton ${readyToWithdraw ? "active" : ""}`}
                            onClick={handleCreateWithdraw}
                            >
                            <h2>ВЫВЕСТИ</h2>
                        </div>
                        
                    </div>
                    <div class="AddressWalletMainContainer">
                    <div className={`AddressWalletContainer ${isAddressNeutral ? "" : (addrClean.length > 0 ? "valid" : "invalid")}`}>
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
                            let next = sanitizeAddress(raw); // только базовая санитизация

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
                            let cleaned = sanitizeAddress(txt); // без доп. проверок

                            setWalletAddress(cleaned);
                            document.execCommand("insertText", false, cleaned);

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
                            e.currentTarget.textContent = "Кошелёк TON или реквизиты";
                            setWalletAddress("Кошелёк TON или реквизиты");
                            setIsAddressNeutral(true);
                            }
                        }}
                        />
                    </div>
                    <div class="AddressWalletPasteContainer">
                        <img src={PasteIMG}/>
                    </div>
                    </div>
                </div>

                <div class="textOrderHistory-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>История заявок на вывод</h2>
                    <div class="line-right"></div>
                </div>



    {sorted.map((o, i) => {
      const cls = getOrderClass(i, sorted.length);

      // удобный формат для даты/времени:
      const dt = new Date(o.createdAt || Date.now());
      const dateStr = dt.toLocaleDateString("ru-RU");
      const timeStr = dt.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});

      // пример подсветки адреса (первые/последние 5 символов)
      const addr = o.address || "";
      const head = addr.slice(0, 5);
      const tail = addr.slice(-5);
      const mid  = addr.slice(5, -5);

      return (
        <div key={o._id || `${o.address}-${o.createdAt}-${i}`} className={cls}>
          <div className="textWithdrawAndAmountContainer">
            <div className="textWithdrawAndAmountContainerPart1">
              <h2>ВЫВОД</h2>
              <div className="textAmountAndLogoContainer">
                <h2><span className="accent">{o.amount}</span> USDT</h2>
                <img src={usdtIMG} alt="" />
              </div>
            </div>
            <div className="textWithdrawAndAmountContainerPart2">
              <h2>{o.status || "в обработке"}</h2>
              <div className="lineOrder-right" />
            </div>
          </div>

          <div className="infoOrderWalletContainer">
            <img src={walletIMG} alt="" />
            <h2>
              <span className="accent">{head}</span>
              {mid}
              <span className="accent">{tail}</span>
            </h2>
          </div>

          <div className="infoTimeAndDataContainer">
            <h2>Дата: {dateStr}</h2>
            <h2>Время: {timeStr}</h2>
          </div>
        </div>
      );
    })}



                {/* <div class="mainSecondOrderContainer">
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
                </div> */}

                
                <div className="footerWithdrawContainer">
                    <div className="footerTelegramChannel" onClick={() =>
                        window.Telegram?.WebApp?.openTelegramLink("https://t.me/aimi_traffic")
                    }>
                        <h2>AIMI TRAFFIC</h2>
                        <img src={TelegramIMG}/>
                    </div>
                    <div className="footerSupportButton" onClick={() =>
                        window.Telegram?.WebApp?.openTelegramLink("https://t.me/")
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