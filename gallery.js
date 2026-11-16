
/* GALLERYの表示処理 */

const paintingList = document.getElementById("painting-list");
const writingList = document.getElementById("writing-list");

const morePaintings = document.getElementById("more-paintings");
const moreWritings = document.getElementById("more-writings");

/* 絵と文章で別々の設定 */
let paintingOrder = "new";
let writingOrder = "new";

let paintingLimit = 8;
let writingLimit = 6;

/* 並び替え */
function sortWorks(works, order) {
  const items = [...works];

  if (order === "new") {
    items.sort((a, b) => b.date.localeCompare(a.date));
  } else if (order === "old") {
    items.sort((a, b) => a.date.localeCompare(b.date));
  } else if (order === "random") {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  return items;
}

let sortedPaintings = [];
let sortedWritings = [];

/* 絵を表示 */
function renderPaintings() {
  paintingList.replaceChildren();

  sortedPaintings.slice(0, paintingLimit).forEach(work => {
    const figure = document.createElement("figure");
    figure.className = "artwork";

    const img = document.createElement("img");
    img.src = work.src;
    img.alt = work.alt ?? work.title;
    img.loading = "lazy";
    img.draggable = false;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.append(img, caption);
    paintingList.append(figure);
  });

  morePaintings.hidden =
    paintingLimit >= sortedPaintings.length;
}

/* 文章を表示 */
function renderWritings() {
  writingList.replaceChildren();

  sortedWritings.slice(0, writingLimit).forEach(work => {
    const article = document.createElement("article");
    article.className = "writing-card";

    const title = document.createElement("h3");
    title.textContent = work.title;

    const body = document.createElement("p");
    body.textContent = work.text;

    article.append(title, body);
    writingList.append(article);
  });

  moreWritings.hidden =
    writingLimit >= sortedWritings.length;
}

/* 絵だけ並び替える */
function updatePaintings() {
  sortedPaintings = sortWorks(paintingWorks, paintingOrder);
  renderPaintings();
}

/* 文章だけ並び替える */
function updateWritings() {
  sortedWritings = sortWorks(writingWorks, writingOrder);
  renderWritings();
}

/* 絵の並び替えボタン */
document.querySelectorAll(
  "#painting-controls [data-sort]"
).forEach(button => {
  button.addEventListener("click", () => {
    paintingOrder = button.dataset.sort;
    paintingLimit = 8;
    updatePaintings();
  });
});

/* 文章の並び替えボタン */
document.querySelectorAll(
  "#writing-controls [data-sort]"
).forEach(button => {
  button.addEventListener("click", () => {
    writingOrder = button.dataset.sort;
    writingLimit = 6;
    updateWritings();
  });
});

/* 絵をもっと見る */
morePaintings.addEventListener("click", () => {
  paintingLimit += 8;
  renderPaintings();
});

/* 文章をもっと見る */
moreWritings.addEventListener("click", () => {
  writingLimit += 6;
  renderWritings();
});

/* 画像の右クリック禁止 */
paintingList.addEventListener("contextmenu", event => {
  if (event.target.closest("img")) {
    event.preventDefault();
  }
});

/* 画像のドラッグ禁止 */
paintingList.addEventListener("dragstart", event => {
  if (event.target.closest("img")) {
    event.preventDefault();
  }
});

/* 最初の表示 */
updatePaintings();
updateWritings();
