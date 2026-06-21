# 音頻圖聲音實驗室

一個以 Web Audio API 製作的互動式聲音教材網站，支援頻率產生、麥克風頻譜、分貝觀察、媒體播放視覺化與聲音小遊戲。

## 適用對象

- 國小高年級到國中
- 自然科學、科技、聲音與波動單元

## 學習目標

- 理解頻率、振幅、音高、音量與分貝的關係。
- 使用麥克風與圖表觀察環境聲音。
- 從音樂或影音中辨識頻率能量與節奏變化。
- 透過遊戲練習聽辨低頻、中頻與高頻。

## 主要功能

- 0 到 30000 Hz 系統音頻率產生器
- 麥克風即時頻譜圖與估計分貝
- 本機音訊、影片與可播放媒體連結視覺化
- 聲音偵探與靜音任務遊戲
- 原理探索、生活應用、闖關題庫與自主學習資源

## 本機啟動

```bash
npm install
npm run start
```

啟動後開啟 Vite 顯示的本機網址。

## GitHub Pages

部署網址：

```text
https://prayer168.github.io/Sound_Lab/
```

## 專案結構

```text
.
├─ index.html
├─ css/style.css
├─ js/app.js
├─ data/content.json
├─ data/quiz.json
├─ data/resources.json
├─ data/curriculum.json
└─ docs/
```

## 注意事項

- 麥克風功能需要瀏覽器授權，且通常必須在 localhost 或 HTTPS 環境下執行。
- 部分影音平台會限制跨站播放，建議使用可直接播放的音訊或影片檔案連結。
- 分貝數值是瀏覽器端估計值，適合教學觀察，不等同專業校正儀器。
