
/* ｼﾞｭﾘﾏﾌの表示 */



const julyMuff = document.querySelector(".julyMuff");
const message = document.querySelector(".julyMuff-message");

if (julyMuff && message) {
  const chance = Math.random();
  const imagePath = "images/julyMuff/";

  const absentMessage =
    "残念！ｼﾞｭﾘﾏﾌはいまはいないみたい……";

  if (chance < 0.35) {
    // 35%：通常歩き
    julyMuff.src = imagePath + "julyMuff_hopping.gif";
    julyMuff.style.visibility = "visible";
    message.textContent = "ｼﾞｭﾘﾏﾌは……とっても元気！！";

  } else if (chance < 0.70) {
    // 35%：通常睡眠
    julyMuff.src = imagePath + "julyMuff_sleeping.gif";
    julyMuff.style.visibility = "visible";
    message.textContent = "ｼﾞｭﾘﾏﾌは……おやすみ中。";

  } else if (chance < 0.90) {
    // 20%：本当にいない
    julyMuff.style.visibility = "hidden";
    message.textContent = absentMessage;

  } else {
    // 10%：いないと思ったら実はいた！
    julyMuff.style.visibility = "hidden";
    message.textContent = absentMessage;
    
　　　// 2秒後にメッセージが変化
      setTimeout(() => {
      message.textContent = "残念！ｼﾞｭﾘﾏﾌはいまはいないみたい……？";
　}, 2000);
  　  // 6秒後に登場
  　  setTimeout(() => {
      julyMuff.src = imagePath + "julyMuff_arriving.gif";
      julyMuff.classList.add("julyMuff-arriving");
      julyMuff.style.visibility = "visible";
      message.textContent = "";
      // 1.6秒後に歩き始める
      setTimeout(() => {
        julyMuff.src = imagePath + "julyMuff_walking.gif";
        julyMuff.addEventListener("animationend", () => {
          julyMuff.classList.remove("julyMuff-walk-in");
          // 1.2秒後に眠る
          setTimeout(() => {
            julyMuff.src = imagePath + "julyMuff_sleeping.gif";
            message.textContent = "ｼﾞｭﾘﾏﾌは……おやすみ中。";
          }, 1200);

        }, { once: true });

        julyMuff.classList.remove("julyMuff-arriving");
        julyMuff.classList.add("julyMuff-walk-in");

      }, 1600);

    }, 6000);
  }
}
