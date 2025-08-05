import React from "react";
import sybilBlockCharacter from "../assets/sybilBlockCharacter.png";

import "../styles/SybilBlock.css";

const handleSupportClick = () => {
    window.open("https://t.me/zustrich_lab_hr", "_blank");
};

const SybilBlock = () => {
    return (
    <div className="App">
        <div className="SybilBlock_Window">   
            <div className="mainSybilBlockPageContainer">  
                <div className="info-sybil-block">
                    <div className="info-sybil-nameText">
                    <h2>SYBIL BLOCK</h2>
                    <p>Система обнаружила попытки <br/>недобросовестного использования фарминга.</p>
                    <p>Ваша учётная запись заблокирована в целях<br/>защиты экосистемы и его участников.</p>
                    </div>
                </div>
                <div className="rectangleSybilBlock-support">
                Если вы считаете, что это ошибка, пожалуйста, свяжитесь с поддержкой для разбирательства.
                <div className="rectangleSybilBlock-button-support" onClick={handleSupportClick}>
                    ТЕХ. ПОДДЕРЖКА
                </div>
                </div>
                <div className="sybilBlockCharacter"> 
                    <img src={sybilBlockCharacter} alt=""/>
                </div>
            </div>

        </div>
    </div>
    );
};
  
export default SybilBlock;