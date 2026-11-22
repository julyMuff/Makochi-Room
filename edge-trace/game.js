'use strict';

// trace.png をもとに抽出した輪郭（outline-data.js）をなぞるゲーム。
// 画像を別のものへ差し替える場合は輪郭データも作り直す必要があります。
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const statusEl = document.querySelector('#status');
const progressEl = document.querySelector('#progress');
const hintEl = document.querySelector('#hint');
const resetBtn = document.querySelector('#reset');
const surpriseEl = document.querySelector('#surprise');
const retryBtn = document.querySelector('#retry');

const SIZE = 512;
const OFFSET = 32;
const TRACK_TOLERANCE = 12; // 大きくすると簡単になる（元画像512px基準）
const FINISH_RATIO = 0.90; // 外周の90%をなぞるとクリア
const MAX_AHEAD = 45; // 1回の判定で探索する進行方向の距離
const MAX_BEHIND = 24;

const image = new Image();
image.src = 'trace.png';
image.onload = () => render();
image.onerror = () => {
  statusEl.textContent = 'IMAGE ERROR';
  hintEl.textContent = 'trace.png が読み込めませんでした。';
};

// 入力位置が輪郭のどの部分かを調べるため、各線分の距離を算出する。
const points = OUTLINE_POINTS.map(([x,y]) => ({x:x+OFFSET, y:y+OFFSET}));
const segments = [];
let length = 0;
for (let i=0; i<points.length; i++) {
  const a = points[i];
  const b = points[(i+1)%points.length];
  const dx = b.x-a.x, dy=b.y-a.y;
  const len = Math.hypot(dx,dy);
  if (!len) continue;
  segments.push({a,dx,dy,len,start:length});
  length+=len;
}
const goalProgress = length * FINISH_RATIO;

function onRoute(s) {
  const target = Math.max(0, Math.min(length, s));
  const seg = segments.find(sg => sg.start + sg.len >= target) || segments.at(-1);
  const t = (target - seg.start) / seg.len;
  return {x:seg.a.x+seg.dx*t, y:seg.a.y+seg.dy*t};
}
const start = onRoute(0);
const goal = onRoute(goalProgress);
let phase = 'ready';
let current = 0;
let lastPointer = null;
let touchId = null;

function status(text, hint) {
  statusEl.textContent=text;
  hintEl.textContent=hint;
  progressEl.textContent=`${Math.min(100,Math.round(100*current/goalProgress))}%`;
}
function reset() {
  phase='ready'; current=0; lastPointer=null; touchId=null;
  surpriseEl.hidden=true;
  status('READY','緑のSTARTを押して始めよう。');
  render();
}
function drawMarker(p,color,label,side) {
  ctx.beginPath(); ctx.arc(p.x,p.y,12,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.lineWidth=2.5;ctx.strokeStyle='#141414';ctx.stroke();
  ctx.font='bold 14px ui-monospace, monospace';
  ctx.textAlign=side;
  ctx.lineWidth=4;ctx.strokeStyle='#101018';
  const tx=p.x+(side==='left'?-15:15), ty=p.y-18;
  ctx.strokeText(label,tx,ty);ctx.fillStyle='#fff';ctx.fillText(label,tx,ty);
}
function render() {
  if (!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#08080b'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if (image.complete && image.naturalWidth) {
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,OFFSET,OFFSET,SIZE,SIZE);
  }
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  // 外周の最後の10%はコースではない（GOALがそこで終わるため）
  ctx.strokeStyle='rgba(22,18,23,.9)';ctx.lineWidth=13;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.moveTo(start.x,start.y);
  segments.forEach(seg=>{
    if(seg.start >= goalProgress)return;
    const d=Math.min(seg.len,goalProgress-seg.start);
    ctx.lineTo(seg.a.x+seg.dx*d/seg.len,seg.a.y+seg.dy*d/seg.len);
  });
  ctx.strokeStyle='#79f1d3';ctx.lineWidth=6;ctx.stroke();
  if (current>0) {
    const dot=onRoute(current);
    ctx.beginPath();ctx.arc(dot.x,dot.y,6.5,0,Math.PI*2);
    ctx.fillStyle='#fff';ctx.fill();
  }
  drawMarker(start,'#36f48e','START','right');
  drawMarker(goal,'#ffca69','GOAL','left');
  if (phase==='clear') {
    ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(0,220,576,135);
    ctx.textAlign='center';ctx.fillStyle='#9fffc7';
    ctx.font='bold 38px ui-monospace, monospace';ctx.fillText('CLEAR!',288,300);
  }
}
function position(e) {
  const rect=canvas.getBoundingClientRect();
  return {
    x:(e.clientX-rect.left)*(canvas.width/rect.width),
    y:(e.clientY-rect.top)*(canvas.height/rect.height)
  };
}
function distance(p,q) {return Math.hypot(p.x-q.x,p.y-q.y);}

// 現在位置の前後の線分に限って最寄りの線を探す。
// これにより近接する別の輪郭へ飛んでショートカットするのを抑制する。
function closestOnPath(p, progress) {
  let best=null;
  let score=Infinity;
  for (const seg of segments) {
    if(seg.start>progress+MAX_AHEAD || seg.start+seg.len<progress-MAX_BEHIND) continue;
    const proj=Math.max(0,Math.min(1,((p.x-seg.a.x)*seg.dx+(p.y-seg.a.y)*seg.dy)/(seg.len*seg.len)));
    const s=seg.start+proj*seg.len;
    if(s>goalProgress+1 || s>progress+MAX_AHEAD || s<progress-MAX_BEHIND)continue;
    const x=seg.a.x+proj*seg.dx, y=seg.a.y+proj*seg.dy;
    const d=Math.hypot(p.x-x,p.y-y);
    const candidate=d+Math.abs(s-progress)*.008;
    if(candidate<score) {score=candidate;best={s,d};}
  }
  return best;
}
function fail() {
  if(phase!=='playing')return;
  phase='failed';lastPointer=null;touchId=null;
  status('GAME OVER','線から外れた！');
  surpriseEl.hidden=false;
  retryBtn.focus({preventScroll:true});
}
function win() {
  phase='clear'; current=goalProgress;lastPointer=null;touchId=null;
  status('CLEAR!','クリア！ やりなおすボタンでもう一度。');render();
}
function sample(p) {
  const match=closestOnPath(p,current);
  if(!match || match.d>TRACK_TOLERANCE){fail();return false;}
  current=Math.max(current,match.s);
  if(current>=goalProgress-5){win();return false;}
  return true;
}
function moveTo(p) {
  if(phase!=='playing'||!lastPointer)return;
  const previous=lastPointer;
  const d=distance(previous,p);
  // 極端な座標の飛びを含め、間を細かく判定して壁抜けを防ぐ。
  const steps=Math.max(1,Math.ceil(d/3));
  for(let i=1;i<=steps;i++) {
    const t=i/steps;
    const next={x:previous.x+(p.x-previous.x)*t,y:previous.y+(p.y-previous.y)*t};
    if(!sample(next))return;
  }
  lastPointer=p;
  status('PLAYING','線を外れないように進もう。');render();
}
canvas.addEventListener('pointerdown',e=>{
  if(phase!=='ready')return;
  const p=position(e);
  if(distance(p,start)>22)return;
  e.preventDefault();
  phase='playing';current=0;lastPointer=p;
  if(e.pointerType!=='mouse') {
    touchId=e.pointerId;
    canvas.setPointerCapture(e.pointerId);
  }
  status('PLAYING','線を外れないように進もう。');render();
});
canvas.addEventListener('pointermove',e=>{
  if(phase!=='playing')return;
  if(touchId!==null && e.pointerId!==touchId)return;
  moveTo(position(e));
});
canvas.addEventListener('pointerup',e=>{
  // マウスはSTARTをクリックしてから、ボタンを離してなぞれる。
  // 指の場合は途中で離すと失敗。
  if(touchId===e.pointerId && phase==='playing')fail();
});
canvas.addEventListener('pointercancel',e=>{
  if(touchId===e.pointerId && phase==='playing')fail();
});
canvas.addEventListener('pointerleave',e=>{
  if(e.pointerType==='mouse'&&phase==='playing')fail();
});
resetBtn.addEventListener('click',reset);
retryBtn.addEventListener('click',reset);
surpriseEl.addEventListener('click',e=>{
  if(e.target===surpriseEl || e.target.tagName==='IMG')reset();
});
reset();
