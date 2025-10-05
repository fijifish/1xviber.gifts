import React, { useEffect, useState } from "react";
import "../styles/Main.css";
import depoIMG from "../assets/deposit-icon.png";
import nftsIMG from "../assets/nfts-img.png";


const OnexGifts = () => {

    const userLang = (window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || navigator.language || "").toLowerCase();
    const isRussianLang = ["ru", "uk", "be", "kk", "uz", "ky", "tt"].some((code) => userLang.startsWith(code));

    const t = isRussianLang
    ? {
        title: "ONEX GIFTS",
        description1_part1:
          "Перед доступом к фармингу и DeFi вы",
        description1_part2:
          "должны пройти верификацию A2V —",
        description1_part3:
          "выполнить 2 рекламных задания и получить",
        description1_part4:
          "0.99 TON.",
        description2_part1:
          "По окончанию розыгрыша, если Вы попадете в число",
        description2_part2:
          "победителей на месте этого текста Вам будет доступен",
        description2_part3:
          "минт ключа для активации фарминга в виде NFT.",
        claim: "Присоединиться",
        completed: "ВЫПОЛНЕНО",
    }
    : {
        title: "ONEX GIFTS",
        description1_part1: "Before accessing farming and DeFi, you",
        description1_part2: "must pass A2V verification —",
        description1_part3: "complete 2 ad tasks and receive",
        description1_part4: "0.99 TON.",
        description2_part1: "At the end of the giveaway, if you are among the",
        description2_part2: "winners, this section will allow you to",
        description2_part3: "mint a farming activation key in the form of an NFT.",
        claim: "Join",
        completed: "COMPLETED",
    };

    return (
    <div className="App">
        <div className="CrossPartner_Window">   
            <div className="mainCrossPartnerPageContainer">  
                <div className="info-CrossPartner-block">
                    <div className="info-CrossPartner-nameText">
                    <h2>{t.title}</h2>
                     <img src={nftsIMG} className="nfts-img"/>
                    <p>{t.description2_part1}<br/>{t.description2_part2}<br/>{t.description2_part3}</p>
                    </div>
                </div>

                <div className="text-completed">
                    {t.completed}
                    <div className="rectangle-counter-CrossPartner-completed-ads">
                        50%
                    </div>
                </div>

                <div className="info-CrossPartner-block2"> 
                    <div className="info-CrossPartner-nameText100"> 
                        <div className="rectangle-info-CrossPartner">
                            <h2>
                            <span className="text-in-rectangle-CrossPartner">
                                {"135"}
                            </span>
                            <div className="rectangle-info-CrossPartner-ton">
                                ПАРТНЕРОВ
                            </div>
                            </h2>
                            <p>
                                Присоединись ко всем партнерам, чтобы выполнить первое задание.
                            </p>
                        </div>
                        <div className="rectangle-for-button-claim">
                            <div className="rectangle-button-claim" onClick={() => navigate("/")}>
                            <img src={depoIMG} className="claim-button-icon"/>
                                {t.claim}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default OnexGifts;