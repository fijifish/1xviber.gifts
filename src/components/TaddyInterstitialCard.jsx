// TaddyInterstitialCard.jsx
import React, { useCallback } from "react";
import { useTaddy } from "../hooks/useTaddy";
import useTaddyProgress from "../hooks/useTaddyProgress";
import taddyLogo from "../assets/taddy-logo.png";
import tonusdtIMG from "../assets/tonusdtIcon.png";
import usersIMG from "../assets/usersIcon.png";


export default function TaddyInterstitialCard({
  pubId = import.meta.env.VITE_TADDY_PUB_ID,
  amountTon = 0.3,
  onDone,
}) {
  const { taddy, loading: sdkLoading, error } = useTaddy(pubId);
  const { loading: progLoading, interstitialDone, markCompleted } = useTaddyProgress();

  const handleOpen = useCallback(async () => {
    if (!taddy) return;
    try {
      const success = await taddy.ads().interstitial({
        onClosed: () => console.log("[Taddy] closed"),
      });
      if (success) {
        const res = await markCompleted("interstitial", null, amountTon);
        // мгновенно уведомляем родителя (страница CrossPartnerBlock)
        onDone?.(res);         // 👈 NEW
      }
    } catch (e) {
      console.warn("[Taddy] ads.interstitial failed", e);
    }
  }, [taddy, markCompleted, amountTon, onDone]);

  if (sdkLoading || progLoading || error) return null;
  if (interstitialDone) return null;

  return (
    <div class="mainJettonTaskContainer">
      <div class="mainChannelNameContainer">
        <img src={taddyLogo}/>
      <div class="textChannelNameContainer">
        <div class="textChannelNameContainerPart1">
          TADDY
        </div>
          <div class="text1WINNameContainerPart2">
            Рекламная платформа
          </div>
        </div>
      </div>
      <div class="titleAndBodyTextChannelNameContainer">
        <div class="titleTextChannelNameContainer">
          Обмен трафиком               
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
      <div className="complete1WINContainer" onClick={handleOpen}>
        <h2>ВЫПОЛНИТЬ</h2>
      </div>
        <div className="checkChannelContainer" onClick={() => checkDeposit(5)} role="button">
          <h2>ПРОВЕРИТЬ</h2>
        </div>
      </div>
    </div> 
  );
}