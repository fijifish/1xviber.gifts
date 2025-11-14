// TaddyInterstitialCard.jsx
import React, { useCallback } from "react";
import { useTaddy } from "../hooks/useTaddy";
import useTaddyProgress from "../hooks/useTaddyProgress";
import taddyLogo from "../assets/taddy-logo.png";

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
    <div className="ads-task">
      <div className="info-ads-task-nameText">
        <div className="info-ads-section">
          <div className="infoAdsSection-all-logo">
            <img src={taddyLogo} className="infoAdsSection-all-logo" />
            <h2>ВЫПОЛНИ ЗАДАНИЕ ОТ TADDY!</h2>
          </div>
          <div className="info-ads-section">
            <div className="infoAdsSection-all-text">
              <h2>+{amountTon} TON</h2>
            </div>
          </div>
        </div>
        <div className="task-to-be-ads-complete-button">
          <div className="to-be-complete-ads-button" onClick={handleOpen}>ВЫПОЛНИТЬ</div>
        </div>
      </div>
    </div>
  );
}