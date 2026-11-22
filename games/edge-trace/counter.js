// GitHub Pages / Firebase Web SDK 13.4.0 (CDN, npm不要)
// games/edge-trace/counter.js に保存する。
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  increment
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyC7VhUcYb-FQ0zTRiERF7xJGCfA2L2JFsQ',
  authDomain: 'makochi-game-counter.firebaseapp.com',
  projectId: 'makochi-game-counter',
  storageBucket: 'makochi-game-counter.firebasestorage.app',
  messagingSenderId: '547051032278',
  appId: '1:547051032278:web:3cd42e2341c0a4a0994377'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const counterRef = doc(db, 'counters', 'edge-trace');
const counterEl = document.getElementById('clear-counter');

function setCounter(text) {
  if (counterEl) counterEl.textContent = `TOTAL CLEARS: ${text}`;
}

// 全プレイヤーのクリア回数を表示。値が更新されると自動で再表示。
onSnapshot(counterRef, snapshot => {
  if (!snapshot.exists()) {
    setCounter('データなし');
    console.error('Firestore に counters/edge-trace がありません');
    return;
  }
  const value = snapshot.data().totalClears;
  if (!Number.isSafeInteger(value) || value < 0) {
    setCounter('データ異常');
    console.error('totalClears は0以上の整数にしてください:', value);
    return;
  }
  setCounter(value.toLocaleString('ja-JP'));
}, error => {
  setCounter('接続エラー');
  console.error('Firestore の読み込みに失敗しました:', error);
});

// game.js の win() から送られるイベントを受け取り、1回だけ+1する。
window.addEventListener('edge-trace:clear', async () => {
  try {
    await updateDoc(counterRef, { totalClears: increment(1) });
  } catch (error) {
    console.error('クリア回数の更新に失敗しました:', error);
    // ゲーム自体のCLEAR表示は維持する。
    if (counterEl) counterEl.title = 'クリア回数を保存できませんでした。通信・Firestoreルールを確認してください。';
  }
});
