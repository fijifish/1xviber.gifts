import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Main.css";
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
import usdtIMG from "../assets/usdtIcon.png";
import gamblingIMG from "../assets/gamblingIMG.png";
import cryptoIMG from "../assets/cryptoIMG.png";
import onexIMG from "../assets/onexIMG.png";
import TaddyInterstitialCard from "../components/TaddyInterstitialCard";




// === GetBonus image proxy (RU GEO-friendly) ===
const GB_S3_PROXY =
  import.meta.env.VITE_GB_S3_PROXY ||
  "https://production.getbonus.dev/api/v1/s3/proxy";

const gbImgUrl = (fileName) =>
  fileName ? `${GB_S3_PROXY}?file_name=${encodeURIComponent(fileName)}` : "";


const openTG = (url) => {
  const href = String(url || "").trim();
  const tg = window?.Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(href, { try_browser: true });
  } else if (tg?.openTelegramLink && /^https?:\/\/t\.me\//i.test(href)) {
    tg.openTelegramLink(href);
  } else {
    window.open(href, "_blank", "noopener,noreferrer");
  }
};



const OnexGifts = () => {

    const navigate = useNavigate();
    // Detect UI language once (ru/uk/be/kk/uz considered "Russian-like")
    const isRussianLang = React.useMemo(() => {
      try {
        const tg = window?.Telegram?.WebApp;
        const code = String(
          tg?.initDataUnsafe?.user?.language_code ||
          navigator.language ||
          ""
        ).toLowerCase();
        return (
          code.startsWith("ru") ||
          code.startsWith("uk") ||
          code.startsWith("be") ||
          code.startsWith("kk") ||
          code.startsWith("uz")
        );
      } catch {
        return false;
      }
    }, []);

    const { user, loading: userLoading, refetchUser, updateUser } = useUser();

    // офферы GetBonus
    const [gbTasks, setGbTasks] = useState([]);
    const [offersLoading, setOffersLoading] = useState(true);
    const [userId, setUserId] = useState(null);


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

    const [usdAvailable, setUsdAvailable] = useState(0);
    const [usdLocked, setUsdLocked] = useState(0);

    // --- balances helper: fetch fresh values from backend
    const fetchBalances = async (tid = user?.telegramId) => {
      try {
        if (!tid || !API_BASE) return;
        const r = await fetch(`${API_BASE}/balances?telegramId=${tid}`);
        const d = await r.json();
        if (d?.ok) {
          setUsdAvailable(Number(d.usdAvailable || 0));
          setUsdLocked(Number(d.usdLocked || 0));
        }
      } catch (e) {
        console.error("balances fetch failed:", e);
      }
    };

    // initial balances load
    useEffect(() => {
      if (user?.telegramId) fetchBalances(user.telegramId);
    }, [user?.telegramId]);

    const availableTON = usdToTon(usdAvailable);
    const lockedTON    = usdToTon(usdLocked);

    // текущая вкладка: 'gambling' (по умолчанию) или 'crypto'
    const [activeTab, setActiveTab] = useState('gambling');

    const totalUSD = usdAvailable + usdLocked;
    const totalTON = usdToTon(totalUSD);

    useEffect(() => {
      if (user?.telegramId) fetchBalances(user.telegramId);
    }, [user?.telegramId]);

    const [taskDone, setTaskDone] = useState(Boolean(user?.tasks?.channelSubscribed));

    const [onexDone, setOnexDone] = useState(Boolean(user?.tasks?.onexReferralDone));
    useEffect(() => { setOnexDone(Boolean(user?.tasks?.onexReferralDone)); }, [user?.tasks?.onexReferralDone]);
    const ONEX_OWNER_ID = import.meta.env.VITE_ONEX_OWNER_ID || "";   // telegramId владельца, чьи рефералы считаем
    const ONEX_OWNER_REF = import.meta.env.VITE_ONEX_OWNER_REF || ""; // альтернативно его реф-код из 1x.back

    async function verifyOnexReferral() {
      try {
        if (!user?.telegramId) return alert("Открой через Telegram");
        const payload = {
          telegramId: String(user.telegramId),
          ...(ONEX_OWNER_ID ? { ownerId: String(ONEX_OWNER_ID) } : {}),
          ...(ONEX_OWNER_REF ? { ownerRef: String(ONEX_OWNER_REF) } : {}),
        };
        const r = await fetch(`${API_BASE}/tasks/onex/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await r.json();
        if (!r.ok || !d?.ok) throw new Error(d?.error || "Server error");

        if (d.status === "rewarded" || d.status === "already_completed") {
        setOnexDone(true);
        if (d.user) updateUser(d.user);
        await refetchUser();
        await fetchBalances(user.telegramId);
        alert(d.status === "rewarded" ? "✅ Задание выполнено! Награда начислена" : "✅ Уже выполнено ранее");
        } else if (d.status === "not_found_in_owner_referrals") {
        alert("❌ Вас пока нет в списке рефералов. Завершите действие в ONEX и повторите проверку.");
        } else if (d.status === "not_completed_stake_threshold") {
        const need = Number(d?.minStake ?? 7);
        alert(`⚠️ Условие не выполнено.\nТребуется активная/купленная нода со стейком ≥ ${need} TON.`);
        } else if (d.status === "not_completed_farming_required") {
          const st = d?.freeOnex ? ` (сейчас: ${d.freeOnex})` : "";
          alert(`⚠️ Условие ONEX не выполнено: нужно запустить бесплатный фарминг.`);
        } else {
        alert("⚠️ Не удалось подтвердить выполнение. Попробуйте позже.");
        }
      } catch (e) {
        console.error("verifyOnexReferral error", e);
        alert("Ошибка проверки ONEX задания");
      }
    }

    // если пришёл свежий user из контекста — обновим локальный стейт
    useEffect(() => {
    setTaskDone(Boolean(user?.tasks?.channelSubscribed));
    }, [user?.tasks?.channelSubscribed]);

    const [mostbetDone, setMostbetDone] = useState(Boolean(user?.tasks?.mostbetCompleted));
    useEffect(() => {
    setMostbetDone(Boolean(user?.tasks?.mostbetCompleted));
    }, [user?.tasks?.mostbetCompleted]);

    const [taddyDone, setTaddyDone] = useState(Boolean(user?.tasks?.taddyCompleted));
    useEffect(() => {
      setTaddyDone(Boolean(user?.tasks?.taddyCompleted));
    }, [user?.tasks?.taddyCompleted]);


    const TADDY_REWARD_USD = 5; // например 5$ за Тедди — можешь вынести в env

    const handleTaddyDone = async () => {
      try {
        if (!user?.telegramId) {
          alert("Открой через Telegram");
          return;
        }

        const resp = await fetch(`${API_BASE}/tasks/taddy/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId: String(user.telegramId),
            amountUsd: TADDY_REWARD_USD,   // можно не передавать, если фикс на беке
          }),
        });

        const data = await resp.json();
        if (!resp.ok || !data?.ok) throw new Error(data?.error || "Server error");

        if (data.user) {
          updateUser(data.user);
        }
        setTaddyDone(true);
        await refetchUser();
        await fetchBalances(user.telegramId);

        if (data.status === "rewarded") {
          alert(`✅ Тедди выполнено! Награда +${data.rewardUsd || TADDY_REWARD_USD}$`);
        } else {
          alert("✅ Задание Тедди уже было выполнено ранее.");
        }
      } catch (e) {
        console.error("Taddy complete error:", e);
        alert("Ошибка обработки задания Тедди");
      }
    };

    const telegramId  = user?.telegramId;
    const displayName = user?.firstName || user?.username || (telegramId ? `id${telegramId}` : "User");
    const displayUsername = user?.username ? `@${user.username}` : (telegramId ? `id${telegramId}` : "");
    const initials = (user?.firstName || user?.username || String(telegramId || "U"))
    .slice(0,2)
    .toUpperCase();

    useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    const u = tg?.initDataUnsafe?.user;
    if (!u?.id) return;
    setUserId(u.id);

    (async () => {
        try {
        const platform = String(tg?.platform || "").toLowerCase(); // 'ios' | 'android' | 'tdesktop' | 'macos' | 'windows' ...
        const url = `${API_BASE}/gb/tasks?telegramId=${u.id}&platform=${encodeURIComponent(platform)}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.ok && Array.isArray(d.tasks)) setGbTasks(d.tasks);
        } catch (e) {
        console.error("Ошибка при загрузке офферов:", e);
        } finally {
        setOffersLoading(false);
        }
    })();
    }, []);

    // Используем только реальные офферы от GetBonus (белый список ID)
    const GB_ALLOWED_IDS = [22, 81, 28];
    const tasksForRender = gbTasks.filter(
      (t) => GB_ALLOWED_IDS.includes(Number(t?.id ?? t?.task_id))
    );


    const openRef = (baseUrl) => {
      const url = String(baseUrl)
        .replace("{telegramId}", String(user?.telegramId || ""))
        .replace("{click_id}", `tg_${user?.telegramId || "0"}`);
      openTG(url);
    };

    const checkDeposit = async (minUsd) => {
      try {
        if (!user?.telegramId) return alert(isRussianLang ? "Откройте через Telegram" : "Open via Telegram");
        const qs = new URLSearchParams({ userId: String(user.telegramId), minUsd: String(minUsd) });
        const r = await fetch(`${API_BASE}/check-casino-deposit?${qs.toString()}`);
        const d = await r.json();
        if (d?.ok && d.deposited) {
          return alert(isRussianLang ? "Депозит найден — задача выполнена ✅" : "Deposit detected — task completed ✅");
        }
        const need = Number(d?.minUsd || minUsd || 0);
        const have = Number(d?.totalUsd || 0);
        if (need > 0) {
          const left = Math.max(0, need - have).toFixed(2);
          return alert(isRussianLang
            ? `Недостаточно депозита. Нужно: ${need}$, есть: ${have}$. Осталось: ${left}$.`
            : `Insufficient deposit. Required: ${need}$, you have: ${have}$. Left: ${left}$.`);
        }
        return alert(isRussianLang ? "Депозит пока не найден. Попробуйте позже." : "No deposit yet. Try again later.");
      } catch (e) {
        console.error("checkDeposit error", e);
        alert(isRussianLang ? "Ошибка проверки депозита" : "Deposit check error");
      }
    };

    const checkDepositMostbet = async (minUsd) => {
      try {
        if (!user?.telegramId) {
          alert("Нет telegramId пользователя");
          return;
        }

        // 1️⃣ Проверяем депозит
        const checkUrl = `${API_BASE}/mostbet/check-deposit?telegramId=${user.telegramId}&minUsd=${minUsd}`;
        const r = await fetch(checkUrl);
        const d = await r.json();

        if (!r.ok || !d?.ok) throw new Error(d?.error || "Server error");

        if (!d.deposited) {
          const need = Number(d.minUsd || 0);
          const have = Number(d.fdpUsd || 0);
          const left = Math.max(0, need - have).toFixed(2);
          alert(`❌ Недостаточно депозита. Нужно ${need}$, найдено ${have}$. Осталось ${left}$.`);
          return;
        }

        // 2️⃣ Если депозит найден — вызываем verify для награды
        const verifyResp = await fetch(`${API_BASE}/tasks/mostbet/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegramId: user.telegramId, minUsd }),
        });

        const verifyData = await verifyResp.json();
        if (!verifyResp.ok || !verifyData?.ok) throw new Error(verifyData?.error || "Ошибка verify");

        if (verifyData.status === "rewarded") {
          const plus = typeof verifyData.rewardUsd === "number" ? `${verifyData.rewardUsd} USDT` : "награда";
          alert(`✅ Задание выполнено! ${plus} начислено 🎉`);
          updateUser(verifyData.user);
          setMostbetDone(true);
          await refetchUser();
          await fetchBalances(user.telegramId);
        } else if (verifyData.status === "already_completed") {
          alert("✅ Задание уже выполнено ранее!");
          updateUser(verifyData.user);
          setMostbetDone(true);
          await refetchUser();
          await fetchBalances(user.telegramId);
        } else if (verifyData.status === "not_completed") {
          alert("❌ Депозит найден, но не соответствует условиям (например, сумма меньше минимальной).");
        }

      } catch (e) {
        console.error("checkDepositMostbet error:", e);
        alert("Ошибка проверки депозита");
      }
    };


    async function verifyChannel() {
      try {
        if (!user?.telegramId) return;
        const r = await fetch(`${API_BASE}/tasks/channel/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegramId: user.telegramId }),
        });
        const data = await r.json();
        if (!data.ok) throw new Error(data.error || "Ошибка проверки");

        if (data.status === "not_subscribed") {
          alert("Сначала подпишись на канал, затем нажми ПРОВЕРИТЬ");
          return;
        }

        // 1) моментально обновляем UI
        if (data.user) {
          updateUser(data.user);
        } else if (data.status === "rewarded") {
          updateUser({
            balanceTon: Number(user?.balanceTon || 0) + Number(data?.reward?.ton || 0),
            tasks: { ...(user?.tasks || {}), channelSubscribed: true },
          });
        } else if (data.status === "already_claimed") {
          updateUser({
            tasks: { ...(user?.tasks || {}), channelSubscribed: true },
          });
        }
        setTaskDone(true);
        // 2) затем жёстко синхронизируемся с БД
        await refetchUser();
        await fetchBalances(user.telegramId);

        if (data.status === "rewarded") {
          alert(`Награда начислена: +${data.reward.ton} TON 🎉`);
        } else if (data.status === "already_claimed") {
          // опционально: уведомление
        }
      } catch (e) {
        alert(e.message);
      }
    }

    // --- GetBonus helpers ---
    const openGbClick = async (taskId) => {
      try {
        if (!user?.telegramId) return alert("Откройте через Telegram");
        if (!API_BASE) {
          console.error("[GB] API_BASE is empty. Set VITE_API_BASE to your backend URL.");
          return alert("Ошибка конфигурации: нет API_BASE");
        }
        const tg = window?.Telegram?.WebApp;
        const platform = String(tg?.platform || "").toLowerCase();
        const qs = new URLSearchParams({ telegramId: String(user.telegramId), taskId: String(taskId), platform }).toString();
        const url = `${API_BASE}/gb/click?${qs}`;
        console.log("[GB] openGbClick →", url, { platform, telegramId: String(user.telegramId), taskId: String(taskId) });
        const resp = await fetch(url, { method: "GET" });
        const data = await resp.json().catch(() => ({}));
        console.log("[GB] openGbClick ←", resp.status, data);
        if (!resp.ok || !data?.ok || !data?.url) throw new Error(data?.error || "Нет ссылки");
        openTG(data.url);
      } catch (e) {
        console.error("openGbClick error", e);
        alert("Не удалось открыть оффер");
      }
    };

    const checkGbTask = async (taskId) => {
    try {
        if (!user?.telegramId) return alert("Откройте через Telegram");

        setGbStatus(s => ({ ...s, [taskId]: "checking" }));

        const tg = window?.Telegram?.WebApp;
        const platform = String(tg?.platform || "").toLowerCase();
        const qs = new URLSearchParams({
        telegramId: String(user.telegramId),
        taskId: String(taskId),
        platform
        }).toString();

        const url = `${API_BASE}/gb/check?${qs}`;
        const resp = await fetch(url, { method: "GET" });
        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || "Ошибка проверки");
        }

        // Бек может вернуть: status: rewarded|already_completed|pending (+ done_status=2)
        const status = String(data?.status || "").toLowerCase();
        const done =
        data?.done_status === 2 ||
        ["rewarded", "already_completed", "done", "completed", "success", "true"].includes(status);

        if (done) {
        setGbStatus(s => ({ ...s, [taskId]: "done" }));
        // подтянем свежего юзера и балансы (учитывая начисления 5$ / 10$)
        await refetchUser();
        if (user?.telegramId) await fetchBalances(user.telegramId);
        alert(status === "already_completed"
            ? "✅ Задание уже было выполнено ранее."
            : "✅ Задание выполнено! Награда начислена/начисляется 🎉"
        );
        return;
        }

        // не засчитано
        setGbStatus(s => ({ ...s, [taskId]: "idle" }));
        alert("❌ Пока не засчитано. Попробуйте позже — возможна задержка трекинга.");
    } catch (e) {
        console.error("checkGbTask error", e);
        setGbStatus(s => ({ ...s, [taskId]: "idle" }));
        alert("Ошибка проверки задания");
    }
    };

    const [gbStatus, setGbStatus] = useState({}); 
    // форма: { [taskId]: 'idle' | 'checking' | 'done' }

    useEffect(() => {
    const init = {};
    (gbTasks || []).forEach(t => {
        const id = Number(t?.id ?? t?.task_id);
        const gb = user?.tasks?.gb;
        if (!id || !gb) return;
        const key = String(id);
        const node = typeof gb.get === "function" ? gb.get(key) : gb[key];
        if (node?.done) init[id] = "done";
    });
    setGbStatus(s => ({ ...s, ...init }));
    }, [user?.tasks?.gb, gbTasks]);

    const isGbDone = (id) =>
    gbStatus[id] === "done" || Boolean(user?.tasks?.[`gb_${id}`]);

    const [gbCheckLoading, setGbCheckLoading] = React.useState({}); // { [taskId]: boolean }

    // GB: универсальный читатель done-статуса (работает и с Map, и с plain-объектом)
    const isGbTaskDoneFn = (u, taskId) => {
    const gb = u?.tasks?.gb;
    if (!gb) return false;
    const key = String(taskId);
    const node = typeof gb.get === "function" ? gb.get(key) : gb[key];
    return Boolean(node?.done);
    };

    // —–– Универсальный рендер оффера GetBonus
    const renderGbTaskCard = ({ task, idx }) => {
    const id = Number(task?.id ?? task?.task_id);
    const title = task?.title || task?.name || "Партнёрский оффер";
    const category = task?.category || "Оффер";
    const photo = gbImgUrl(task?.photo);
    // const bg = gbImgUrl(task?.background_photo);
    const isBusy = Boolean(gbCheckLoading[id]);
    const done = isGbTaskDoneFn(user, id) || isGbDone(id);  
    const bg = null; 

    // Класс карточки по id задачи: общий базовый + специфичный для id
    const containerClass = `gbTaskCard gbTaskId-${id}`;


    return (
        <div
        key={id}
        className={containerClass}
        >
        <div className="mainChannelNameContainer">
            <img src={photo || OneWinIMG} />
            <div className="textChannelNameContainer">
            <div className="textChannelNameContainerPart1">{title}</div>
            <div className="text1WINNameContainerPart2">Казино</div>
            </div>
        </div>

        <div className="titleAndBodyTextChannelNameContainer">
            <div className="titleTextChannelNameContainer">
                Партнёрская программа
            </div>
            <div class="bodyTextChannelNameContainer">
                В формате условий CPA при внесении депо-<br/>
                зита в размере 5$, мы распределяем 40% от<br/>
                полученных наград для наших пользователей.
            </div>
        </div>

        <div className="taskChannelRewardAndUsersContainer">
            <div className="taskChannelRewardContainer">
            <img src={tonusdtIMG} />
            <h2>7 TON | 15 USDT</h2>
            </div>
            <div className="taskChannelUsersContainer">
            <img src={usersIMG} />
            <h2>794 заработало</h2>
            </div>
        </div>

        <div className="completeAndCheckChannelContainer">
        {done ? (
            <div className="taskChannelCompletedContainer">
            <h2>ВЫПОЛНЕНО</h2>
            </div>
        ) : (
            <>
            <div
                className={`complete1WINContainer ${isBusy ? "disabled" : ""}`}
                onClick={() => !isBusy && openGbClick(id)}
            >
                <h2>{isBusy ? "…" : "ВЫПОЛНИТЬ"}</h2>
            </div>
            <div
                className={`checkChannelContainer ${isBusy ? "disabled" : ""}`}
                onClick={() => !isBusy && checkGbTask(id)}
                role="button"
            >
                <h2>{isBusy ? "ПРОВЕРКА…" : "ПРОВЕРИТЬ"}</h2>
            </div>
            </>
        )}
        </div>
        </div>

    );
    };

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
                                {userLoading ? "" : initials}
                            </div>
                        )}
                    </div>
                    <div className="nickNameContainer">
                        <div className="nickNameContainerPart1">{userLoading ? "Загрузка" : displayName}</div>
                        <div className="nickNameContainerPart2">{userLoading ? "" : displayUsername}</div>
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

                <div class="text5USDT-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>Выполни задание, чтобы получить 5 USDT</h2>
                    <div class="line-right"></div>
                </div>

                <div class="mainChannelTaskContainer">
                    <div class="mainChannelNameContainer">
                        <img src={channelIMG}/>
                        <div class="textChannelNameContainer">
                            <div class="textChannelNameContainerPart1">
                                AIMI Traffic
                            </div>
                            <div class="textChannelNameContainerPart2">
                                Канал
                            </div>
                        </div>
                    </div>
                    <div class="titleAndBodyTextChannelNameContainer">
                        <div class="titleTextChannelNameContainer">
                            Канал об арбитраже
                        </div>
                        <div class="bodyTextChannelNameContainer">
                            AIMI Traffic даёт возможность зарабатывать<br/>10 USDT за живого подписчика с СНГ региона.<br/>Мы делимся наградой с Вами 50/50.
                        </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                        <div className="taskChannelRewardContainer">
                            <img src={usdtIMG}/>
                            <h2>5 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>2 472 заработало</h2> 
                        </div>
                    </div>
                        <div className="completeAndCheckChannelContainer">
                        {taskDone ? (
                            // ✅ вариант «после выполнения»
                            <div className="taskChannelCompletedContainer">
                                <h2>ВЫПОЛНЕНО</h2>
                            </div>
                        ) : (
                            // ⬅️ вариант «до выполнения»
                            <>
                            <div
                                className="completeChannelContainer"
                                onClick={() => openTG("https://t.me/aimi_traffic")}
                            >
                                <h2>ПОДПИСАТЬСЯ</h2>
                            </div>
                            <div className="checkChannelContainer" onClick={verifyChannel}>
                                <h2>ПРОВЕРИТЬ</h2>
                            </div>
                            </>
                        )}
                    </div>
                </div>

                <div class="textAvaliableWay-with-linesContainer">
                    <div class="AvaliableWay-line-left"></div> 
                        <h2>Направления доступных CPA заданий</h2> 
                    <div class="AvaliableWay-line-right"></div>
                </div> 

                <div className="selectAvaliableWayContainer">
                <div
                    className={`gamblingAvaliableWayContainer ${activeTab === 'gambling' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gambling')}
                    role="button"
                >
                    <img src={gamblingIMG}/>
                    <h2>Гемблинг</h2> 
                </div>

                <div
                    className={`cryptoAvaliableWayContainer ${activeTab === 'crypto' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crypto')}
                    role="button"
                >
                    <img src={cryptoIMG}/>
                    <h2>Криптовалюта</h2> 
                </div>
                </div>

                {activeTab === 'gambling' && (      
                    <>

                <div class="text25USDT-with-linesContainer">
                    <div class="line-left"></div> 
                        <h2>Выполни задания, чтобы получить 25 USDT</h2> 
                    <div class="line-right"></div>
                </div> 

                {!offersLoading &&
                tasksForRender.length > 0 &&
                tasksForRender.slice(0, 3).map((t, i) => renderGbTaskCard({ task: t, idx: i }))}
                
                {/* <div class="main1WINTaskContainer">
                    <div class="mainChannelNameContainer">
                        <img src={OneWinIMG}/>
                        <div class="textChannelNameContainer">
                            <div class="textChannelNameContainerPart1">
                                1WIN
                            </div>
                            <div class="text1WINNameContainerPart2">
                                Казино
                            </div>
                        </div>
                    </div>
                    <div class="titleAndBodyTextChannelNameContainer">
                        <div class="titleTextChannelNameContainer">
                            Партнёрская программа
                        </div>
                        <div class="bodyTextChannelNameContainer">
                            В формате условий CPA при внесении депо-<br/>
                            зита в размере 5$, мы распределяем 33% от<br/>
                            полученных наград для наших пользователей.
                        </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                        <div className="taskChannelRewardContainer">
                            <img src={tonusdtIMG}/>
                            <h2>3.6 TON | 10 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>3 009 заработало</h2> 
                        </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                        <div className="complete1WINContainer">
                            <h2>ВЫПОЛНИТЬ</h2>
                        </div>
                        <div className="checkChannelContainer">
                            <h2>ПРОВЕРИТЬ</h2>
                        </div>
                    </div>
                </div> */}


                <div class="mainMostbetTaskContainer">
                    <div class="mainChannelNameContainer">
                        <img src={MostbetIMG}/>
                        <div class="textChannelNameContainer">
                            <div class="textChannelNameContainerPart1">
                                MOSTBET
                            </div>
                            <div class="text1WINNameContainerPart2">
                                Казино
                            </div>
                        </div>
                    </div>
                    <div class="titleAndBodyTextChannelNameContainer">
                        <div class="titleTextChannelNameContainer">
                            Партнёрская программа
                        </div>
                        <div class="bodyTextChannelNameContainer">
                            В формате условий CPA при внесении депо-<br/>
                            зита в размере 5$, мы распределяем 33% от<br/>
                            полученных наград для наших пользователей.
                        </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                        <div className="taskChannelRewardContainer">
                            <img src={tonusdtIMG}/>
                            <h2>3.6 TON | 10 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>4 704 заработало</h2> 
                        </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                    {mostbetDone ? (
                        <div className="taskChannelCompletedContainer">
                        <h2>ВЫПОЛНЕНО</h2>
                        </div>
                    ) : (
                        <>
                        <div
                            className="complete1WINContainer"
                            onClick={() => openRef(import.meta.env.VITE_MOSTBET_REF)}
                        >
                            <h2>ВЫПОЛНИТЬ</h2>
                        </div>
                        <div
                            className="checkChannelContainer"
                            onClick={() => checkDepositMostbet(5)}
                            role="button"
                        >
                            <h2>ПРОВЕРИТЬ</h2>
                        </div>
                        </>
                    )}
                    </div>
                </div>


                <div class="mainJettonTaskContainer">
                    <div class="mainChannelNameContainer">
                        <img src={JettonIMG}/>
                        <div class="textChannelNameContainer">
                            <div class="textChannelNameContainerPart1">
                                JETTON
                            </div>
                            <div class="text1WINNameContainerPart2">
                                Казино
                            </div>
                        </div>
                    </div>
                    <div class="titleAndBodyTextChannelNameContainer">
                        <div class="titleTextChannelNameContainer">
                            Партнёрская программа
                        </div>
                        <div class="bodyTextChannelNameContainer">
                            В формате условий CPA при внесении депо-<br/>
                            зита в размере 5$, мы распределяем 33% от<br/>
                            полученных наград для наших пользователей.
                        </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                        <div className="taskChannelRewardContainer">
                            <img src={tonusdtIMG}/>
                            <h2>1.8 TON | 5 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>1 636 заработало</h2> 
                        </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                        <div className="complete1WINContainer" onClick={() => openRef(import.meta.env.VITE_JETTON_REF)}>
                            <h2>ВЫПОЛНИТЬ</h2>
                        </div>
                        <div className="checkChannelContainer" onClick={() => checkDeposit(5)} role="button">
                            <h2>ПРОВЕРИТЬ</h2>
                        </div>
                    </div>
                </div> 
                
                {!taddyDone && (
                  <div className="mainHomePageContainer">
                    <TaddyInterstitialCard
                      amountTon={usdToTon(TADDY_REWARD_USD)} // можно просто число, если внутри в USDT
                      onDone={handleTaddyDone}
                    />
                  </div>
                )}
         
                </>
                )}

                {activeTab === 'crypto' && (
                <>
                    <div className="text25USDT-with-linesContainer">
                        <div className="line-left"></div> 
                            <h2>Выполни задания, чтобы получить 25 USDT</h2> 
                        <div className="line-right"></div>
                    </div>

                {/* ONEX referral task */}
                <div className="mainOnexTaskContainer">
                    <div className="mainChannelNameContainer">
                        <img src={onexIMG}/>
                        <div className="textChannelNameContainer">
                            <div className="textChannelNameContainerPart1">
                                ONEX
                            </div>
                            <div className="textOnexNameContainerPart2">
                                Стейкинг
                            </div>
                        </div>
                    </div>
                    <div className="titleAndBodyTextChannelNameContainer">
                        <div className="titleTextChannelNameContainer">
                            Партнёрская программа
                        </div>
                        <div className="bodyTextChannelNameContainer">
                            В формате условий CPA при активации любой<br/>
                            платной фарминг ноды, вы получите 33% от<br/>
                            фиксированной выплаты за реферала.
                        </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                        <div className="taskChannelRewardContainer">
                            <img src={tonusdtIMG}/>
                            <h2>3.6 TON | 10 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>1 051 заработало</h2> 
                        </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                      {onexDone ? (
                        <div className="taskChannelCompletedContainer"><h2>ВЫПОЛНЕНО</h2></div>
                      ) : (
                        <>
                          <div className="complete1WINContainer"
                            onClick={() => window.Telegram?.WebApp?.openTelegramLink("https://t.me/onex_ton_bot?start=X57Z7vwC")}>
                            <h2>ВЫПОЛНИТЬ</h2>
                          </div>
                          <div className="checkChannelContainer" onClick={verifyOnexReferral} role="button">
                            <h2>ПРОВЕРИТЬ</h2>
                          </div>
                        </>
                      )}
                    </div>
                </div>
                </>
                )}



                <div className="footerContainer">
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
};

export default OnexGifts;

