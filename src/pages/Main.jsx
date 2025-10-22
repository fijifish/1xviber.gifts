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

    const totalUSD = usdAvailable + usdLocked;
    const totalTON = usdToTon(totalUSD);

    useEffect(() => {
      if (user?.telegramId) fetchBalances(user.telegramId);
    }, [user?.telegramId]);

    const [taskDone, setTaskDone] = useState(Boolean(user?.tasks?.channelSubscribed));

    // если пришёл свежий user из контекста — обновим локальный стейт
    useEffect(() => {
    setTaskDone(Boolean(user?.tasks?.channelSubscribed));
    }, [user?.tasks?.channelSubscribed]);

    const [mostbetDone, setMostbetDone] = useState(Boolean(user?.tasks?.mostbetCompleted));
    useEffect(() => {
    setMostbetDone(Boolean(user?.tasks?.mostbetCompleted));
    }, [user?.tasks?.mostbetCompleted]);

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
        const tg = window?.Telegram?.WebApp;
        const platform = String(tg?.platform || "").toLowerCase();
        const qs = new URLSearchParams({ telegramId: String(user.telegramId), taskId: String(taskId), platform }).toString();
        const url = `${API_BASE}/gb/check?${qs}`;
        console.log("[GB] checkGbTask →", url);
        const resp = await fetch(url, { method: "GET" });
        const data = await resp.json().catch(() => ({}));
        console.log("[GB] checkGbTask ←", resp.status, data);
        if (!resp.ok || !data?.ok) throw new Error(data?.error || "Ошибка проверки");
        const status = String(data?.status ?? "").toLowerCase();
        if (["ok", "done", "success", "completed", "true"].includes(status)) {
          alert("✅ Задание засчитано партнёром. Награда будет начислена по правилам оффера.");
        } else {
          alert("❌ Пока не засчитано. Попробуйте позже — возможна задержка трекинга.");
        }
      } catch (e) {
        console.error("checkGbTask error", e);
        alert("Ошибка проверки задания");
      }
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

                <div class="text25USDT-with-linesContainer">
                    <div class="line-left"></div> 
                        <h2>Выполни задания, чтобы получить 25 USDT</h2> 
                    <div class="line-right"></div>
                </div> 

                {!offersLoading && tasksForRender.length > 0 && tasksForRender.slice(0, 4).map((t) => (
                <div key={t.id || t.task_id} className="mainJettonTaskContainer">
                    <div className="mainChannelNameContainer">
                    <img src={OneWinIMG} />
                    <div className="textChannelNameContainer">
                        <div className="textChannelNameContainerPart1">
                        {t?.name || t?.title || "Оффер"}
                        </div>
                        <div className="text1WINNameContainerPart2">Партнёрский оффер</div>
                    </div>
                    </div>
                    <div className="titleAndBodyTextChannelNameContainer">
                    <div className="titleTextChannelNameContainer">Партнёрская программа</div>
                    <div className="bodyTextChannelNameContainer">
                        Нажмите «Выполнить», зарегистрируйтесь/выполните условия оффера, затем вернитесь и нажмите «Проверить».
                    </div>
                    </div>
                    <div className="taskChannelRewardAndUsersContainer">
                    <div className="taskChannelRewardContainer">
                        <img src={tonusdtIMG} />
                        <h2>Награда по условиям оффера</h2>
                    </div>
                    <div className="taskChannelUsersContainer">
                        <img src={usersIMG} />
                        <h2>доступно</h2>
                    </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                    <div className="complete1WINContainer" onClick={() => openGbClick(t.id || t.task_id)}>
                        <h2>ВЫПОЛНИТЬ</h2>
                    </div>
                    <div className="checkChannelContainer" onClick={() => checkGbTask(t.id || t.task_id)} role="button">
                        <h2>ПРОВЕРИТЬ</h2>
                    </div>
                    </div>
                </div>
                ))}
                {!offersLoading && gbTasks.length === 0 && (
                  <div className="mainJettonTaskContainer">
                    <div className="titleAndBodyTextChannelNameContainer">
                      <div className="titleTextChannelNameContainer">Партнёрские задания</div>
                      <div className="bodyTextChannelNameContainer">
                        В вашем регионе пока нет доступных офферов. Зайдите позже — список обновляется.
                      </div>
                    </div>
                  </div>
                )}
                
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

                <div className="footerContainer">
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
};

export default OnexGifts;

