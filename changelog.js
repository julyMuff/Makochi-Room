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
