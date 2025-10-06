import React, { useEffect, useState } from "react";
import "../styles/Main.css";
import withdrawIMG from "../assets/withdrawIcon.png";
import refferalsIMG from "../assets/refferalsIcon.png";
import tonusdtIMG from "../assets/tonusdtIcon.png";
import channelIMG from "../assets/channelIcon.png";
import usersIMG from "../assets/usersIcon.png";
import OneWinIMG from "../assets/OneWinIcon.png";


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
        <div className="Main_Window">   
            <div className="mainHomePageContainer">  
                <div className="headerContainer">
                    <div className="circleInHeaderContainer">
                        <div className="circleName">
                            AR
                        </div>
                    </div>
                    <div className="nickNameContainer">
                        <div className="nickNameContainerPart1">
                            Gato Tuz
                        </div>
                        <div className="nickNameContainerPart2">
                            @burmalda
                        </div>
                    </div>
                    <div className="mainBalanceContainer">
                        <img src={tonusdtIMG}/>
                        <h2>21.8 TON | 64 USDT</h2> 
                    </div>
                    <div className="withdrawContainer">
                        <img src={withdrawIMG}/>
                    </div>
                    <div className="refferalsContainer">
                        <img src={refferalsIMG}/>
                    </div>
                </div>
                <div class="text-with-linesContainer">
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
                            <img src={tonusdtIMG}/>
                            <h2>1.8 TON | 5 USDT</h2> 
                        </div>
                        <div className="taskChannelUsersContainer">
                            <img src={usersIMG}/>
                            <h2>2 472 заработало</h2> 
                        </div>
                    </div>
                    <div className="completeAndCheckChannelContainer">
                        <div className="completeChannelContainer">
                            <h2>ПОДПИСАТЬСЯ</h2>
                        </div>
                        <div className="checkChannelContainer">
                            <h2>ПРОВЕРИТЬ</h2>
                        </div>
                    </div>
                </div>
                <div class="text-with-linesContainer">
                    <div class="line-left"></div>
                        <h2>Выполни задания, чтобы получить 25 USDT</h2>
                    <div class="line-right"></div>
                </div>
                <div class="main1WINTaskContainer">
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
                            Сделай депозит 5$
                        </div>
                        <div class="bodyTextChannelNameContainer">
                            AIMI Traffic даёт возможность зарабатывать<br/>10 USDT за живого подписчика с СНГ региона.<br/>Мы делимся наградой с Вами 50/50.
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
                </div>
            </div>
        </div>
    </div>
  );
};

export default OnexGifts;