import React, { useEffect, useState } from "react";
import "../styles/CrossPartnerBlock.css";
import CrossPartnerIcon from "../assets/CrossPartnerIcon.png";


const OnexGifts = () => {

    const userLang = (window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || navigator.language || "").toLowerCase();
    const isRussianLang = ["ru", "uk", "be", "kk", "uz", "ky", "tt"].some((code) => userLang.startsWith(code));

    const t = isRussianLang
    ? {
        title: "ADS VERIFY",
        description1_part1:
          "Перед доступом к фармингу и DeFi вы",
        description1_part2:
          "должны пройти верификацию A2V —",
        description1_part3:
          "выполнить 2 рекламных задания и получить",
        description1_part4:
          "0.99 TON.",
        description2_part1:
          "Это защищает систему от ботов и",
        description2_part2:
          "обеспечивает вход без вложений.",
        claim: "Заклеймить",
        completed: "ВЫПОЛНЕНО",
    }
    : {
        title: "ADS VERIFY",
        description1_part1: "Before accessing farming and DeFi, you",
        description1_part2: "must pass A2V verification —",
        description1_part3: "complete 2 ad tasks and receive",
        description1_part4: "0.99 TON.",
        description2_part1: "This protects the system from bots and",
        description2_part2: "provides access without investment.",
        claim: "Claim",
        completed: "COMPLETED",
    };

    return (
    <div className="App">
        <div className="CrossPartner_Window">   
            <div className="mainCrossPartnerPageContainer">  
                <div className="info-CrossPartner-block">
                    <div className="info-CrossPartner-nameText">
                    <h2>{t.title}</h2>
                    <p>{t.description1_part1} <br/>{t.description1_part2} <br/>{t.description1_part3} <br/>{t.description1_part4}</p>
                    <p>{t.description2_part1}<br/>{t.description2_part2}</p>
                    </div>
                </div>
                <div className="info-CrossPartner-block2"> 
                    <div className="info-CrossPartner-nameText55"> 
                        <div className="rectangle-info-CrossPartner">
                            <h2>
                            <span className="text-in-rectangle-CrossPartner">
                                {balance != null ? parseFloat(balance).toFixed(2) : "0.00"}
                            </span>
                            <div className="rectangle-info-CrossPartner-ton">
                                TON
                            </div>
                            </h2>
                            <p>
                            ≈ {balance != null && tonToUsdRate !== null
                            ? (balance * tonToUsdRate).toFixed(2)
                            : "..."} $
                            </p>
                        </div>
                        <div className="rectangle-for-button-claim">
                            <div className="rectangle-button-claim" onClick={() => navigate("/")}>
                            <img src={depoIMG} className="claim-button-icon"/>
                                {t.claim}
                            </div>
                        </div>
                    </div>
                    <div className="info-claim-nameText45"> 
                        {crossImage ? (
                        <img src={crossImage} className="CrossPartner-icon" />
                        ) : (
                        <img src={CrossPartnerIcon} className="CrossPartner-icon" /> // fallback
                        )}
                    </div>
                </div>

                <div className="text-completed">
                    {t.completed}
                    <div className="rectangle-counter-CrossPartner-completed-ads">
                        0/3
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default OnexGifts;