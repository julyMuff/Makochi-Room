
/* ========================================
   JULYMUFF / RANDOM STATE
   ｼﾞｭﾘﾏﾌの状態をランダムで決める
======================================== */

// 50%の確率でどちらかを選ぶ
const isSleeping = Math.random() < 0.5;

// HTMLから画像と文章を取得する
const julyMuff = document.querySelector(".julyMuff");
const message = document.querySelector(".julyMuff-message");

// 抽選結果によって表示を変更する
if (isSleeping) {
  julyMuff.src = "julyMuff_sleeping.gif";
  message.textContent = "ｼﾞｭﾘﾏﾌは……おやすみ中。";
} else {
  julyMuff.src = "julyMuff_hopping.gif";
  message.textContent = "ｼﾞｭﾘﾏﾌは……とっても元気！！";
}
