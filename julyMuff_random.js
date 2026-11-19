
/* ｼﾞｭﾘﾏﾌの表示 */

// HTMLから画像と文章を取得する
const julyMuff = document.querySelector(".julyMuff");
const message = document.querySelector(".julyMuff-message");

// 0〜1の乱数で抽選
const chance = Math.random();

if (chance < 0.45) {
  // 45%：通常歩き
  julyMuff.src = "julyMuff_hopping.gif";
  julyMuff.style.visibility = "visible";
  message.textContent = "ｼﾞｭﾘﾏﾌは……とっても元気！！";

} else if (chance < 0.90) {
  // 45%：通常睡眠
  julyMuff.src = "julyMuff_sleeping.gif";
  julyMuff.style.visibility = "visible";
  message.textContent = "ｼﾞｭﾘﾏﾌは……おやすみ中。";

} else {
  // 10%：特別登場イベント
  julyMuff.style.visibility = "hidden";
  message.textContent = "";

  // 2秒後に登場
  setTimeout(() => {
    julyMuff.src = "julyMuff_arriving.gif";
    julyMuff.classList.add("julyMuff-arriving");
    julyMuff.style.visibility = "visible";

    // 0.8秒後に歩き始める
    setTimeout(() => {
      julyMuff.src = "julyMuff_hopping.gif";
      julyMuff.classList.remove("julyMuff-arriving");

      // 歩き終わったら中央で停止
      julyMuff.addEventListener("animationend", () => {
        julyMuff.classList.remove("julyMuff-walk-in");
        julyMuff.src = "julyMuff_stopping.gif";

        // 1.2秒後に眠る
        setTimeout(() => {
          julyMuff.src = "julyMuff_sleeping.gif";
          message.textContent = "ｼﾞｭﾘﾏﾌは……おやすみ中。";
        }, 1200);

      }, { once: true });

      julyMuff.classList.add("julyMuff-walk-in");

    }, 800);

  }, 2000);
}


/* 更新履歴を読み込む */
fetch("./changelog.html")
  .then(response => {
    if (!response.ok) {
      throw new Error("更新履歴を読み込めませんでした");
    }
    return response.text();
  })
  .then(html => {
    document.getElementById("changelog-container").innerHTML = html;
  })
  .catch(error => console.error(error));
