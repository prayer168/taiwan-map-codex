# 聲音實驗室製作流程紀錄

## 專案基本資訊

- 專案名稱：聲音實驗室
- GitHub repository：`prayer168/Sound_Lab`
- GitHub Pages：<https://prayer168.github.io/Sound_Lab/>
- 本地路徑：`C:\Users\user\我的雲端硬碟\google drive\000000000backup\0000000000數位教材\game\Audio_graph`
- 技術：HTML、CSS、原生 JavaScript、Canvas、SVG、Web Audio API、Vite、GitHub Pages Actions

## 初始需求

使用者希望建立一個音頻圖網站，包含：

- 輸入或調整音頻，範圍 `0-30000 Hz`
- 電腦自動發出系統音
- 使用麥克風輸入，顯示音頻圖與分貝
- 輸入音樂、聲音或影音連結，按播放後顯示科技感動態音頻圖
- 加入其他與聲音相關的互動功能或遊戲

## 專案初始化

1. 檢查工作資料夾，當時資料夾是空的。
2. 初始化 Git：

```bash
git init
git branch -M main
```

3. 建立 Vite 靜態網站結構。
4. 新增主要檔案：

- `index.html`
- `css/style.css`
- `js/app.js`
- `data/content.json`
- `data/quiz.json`
- `data/resources.json`
- `data/curriculum.json`
- `README.md`
- `CHANGELOG.md`
- `docs/lesson-plan.md`
- `docs/design-spec.md`
- `docs/references.md`
- `docs/test-report.md`

5. 首次功能完成後提交：

```bash
git commit -m "feat: build audio spectrum lab"
```

## 第一版功能

第一版建立了 8 個頁籤：

1. 學習任務
2. 頻率產生器
3. 麥克風圖譜
4. 媒體音頻圖
5. 聲音遊戲
6. 原理與應用
7. 闖關挑戰
8. 自主學習

主要功能：

- `0-30000 Hz` 頻率產生器
- 常用頻率按鈕
- 音量控制
- 掃頻測試
- 麥克風頻譜與估計分貝
- 媒體檔案與網址播放視覺化
- 頻率偵探遊戲
- 靜音任務
- 原理卡片、生活應用、自主學習資源與闖關題庫

## GitHub Pages 部署

使用者指定 repository 名稱為 `Sound_Lab`。

完成事項：

- 建立 GitHub repository：<https://github.com/prayer168/Sound_Lab>
- 新增 `.github/workflows/pages.yml`
- 使用 GitHub Actions 部署 `dist`
- 設定 Vite base：

```js
base: process.env.GITHUB_PAGES === "true" ? "/Sound_Lab/" : "./"
```

- 建立 GitHub Pages workflow 部署來源
- 部署網址確認為：<https://prayer168.github.io/Sound_Lab/>

相關提交：

```bash
ci: add github pages deployment
```

## 網站命名調整

原本名稱是「音頻圖聲音實驗室」，後來依使用者要求改成「聲音實驗室」。

修改位置：

- `index.html` 的 `<title>`
- `index.html` 的 `<h1>`
- `README.md`
- `CHANGELOG.md`
- `project.config.json`

相關提交：

```bash
content: rename site to sound lab
```

## 麥克風圖譜問題修正

使用者回報：麥克風有授權、說話時卻沒有圖譜。

逐步修正：

1. 等待 `AudioContext.resume()` 完成。
2. 在麥克風圖譜加入即時波形線。
3. 調整 `AnalyserNode` 的分貝範圍。
4. 加入「訊號振幅」診斷。
5. 加入麥克風靈敏度滑桿。
6. 加入麥克風輸入裝置選單與重新偵測按鈕。
7. 將麥克風分析鏈接到 `0` 音量輸出節點，提高 Chrome 對即時音訊串流的處理相容性。

相關提交：

```bash
fix: improve microphone visualizer
fix: add microphone signal diagnostics
fix: add microphone device selector
```

## 媒體與 YouTube 連結問題修正

使用者嘗試貼 YouTube 連結，起初 `<video>` 無法直接載入。

原因：

- YouTube watch URL 不是直接媒體檔網址。
- 瀏覽器不允許網頁直接讀取跨站 YouTube 影片聲音。
- 有些 YouTube 影片也可能禁止 iframe 嵌入。

逐步修正：

1. 偵測 YouTube 連結。
2. YouTube 連結改用 iframe 嵌入播放器。
3. 若 YouTube 無法嵌入，提供「在 YouTube 開啟」備援。
4. 加入「擷取分頁音訊」功能，使用 `getDisplayMedia({ audio: true })` 擷取播放中的分頁音訊。
5. 將按鈕文案改成「分析 YouTube 聲音」。
6. 將「播放」按鈕改成智慧流程：
   - 直接媒體檔網址：自動載入、播放、分析。
   - YouTube：自動開啟 Chrome 分頁音訊擷取流程。

限制說明：

- YouTube 不能做到完全無提示直接分析，因為 Chrome 必須讓使用者手動選擇分享分頁並勾選分頁音訊。
- 直接媒體檔網址，如 `.mp3`、`.wav`、`.ogg`、`.mp4`、`.webm`，可以按播放後直接分析。

相關提交：

```bash
fix: handle youtube media links
feat: add youtube audio capture fallback
ux: clarify youtube audio analysis
feat: make media play start analysis
```

## 三個資料頁籤空白問題修正

使用者回報以下頁籤空白：

- 原理與應用
- 闖關挑戰
- 自主學習

原因：

- Vite build 後，`data/*.json` 沒有被部署到 GitHub Pages。
- 線上讀取 `/data/content.json`、`/data/quiz.json` 等路徑時回傳 404。

修正：

1. 建立 `public/data`。
2. 複製資料檔到 `public/data`：
   - `content.json`
   - `quiz.json`
   - `resources.json`
   - `curriculum.json`
3. Vite build 後確認 `dist/data/*.json` 存在。
4. 加入資料載入錯誤提示，避免靜默空白。
5. 部署後確認：
   - `https://prayer168.github.io/Sound_Lab/data/content.json` 回應 `200`
   - `https://prayer168.github.io/Sound_Lab/data/quiz.json` 回應 `200`

相關提交：

```bash
fix: publish content data for pages
```

## 聲音遊戲調整

### 頻率偵探

原本功能：

- 隨機播放一段頻率
- 玩家判斷屬於：
  - 低頻 `80-300 Hz`
  - 中頻 `300-2000 Hz`
  - 高頻 `2000-9000 Hz`
  - 超高頻 `9000 Hz` 以上

後續問題：

- 使用者回報聲音太小聲。

修正：

- 新增「偵探音量」滑桿
- 預設音量從 `0.08` 提高到 `0.28`
- 低頻與高頻自動音量補償
- 加入壓縮器避免破音或刺耳

相關提交：

```bash
fix: increase frequency detective volume
```

### 靜音任務改成生物聲音猜猜看

使用者要求：

- 把「靜音任務」改成各種生物聲音。
- 至少 20 種。
- 隨機出現。
- 讓玩家去猜。

完成內容：

- 移除原本的靜音任務介面與邏輯。
- 新增「生物聲音猜猜看」。
- 使用 Web Audio 合成生物聲音，不依賴外部音檔。
- 隨機出題。
- 四選一作答。
- 顯示題數、答對數、生物類型。
- 支援重播聲音。

目前生物共 22 種：

- 狗
- 貓
- 青蛙
- 蟋蟀
- 蜜蜂
- 蚊子
- 貓頭鷹
- 海豚
- 鯨魚
- 公雞
- 牛
- 羊
- 馬
- 大象
- 狼
- 烏鴉
- 鴨子
- 蟬
- 猴子
- 豬
- 蛇
- 山羊

相關提交：

```bash
feat: add biological sound guessing game
```

### 生物聲音太小與不像的修正

使用者回報：

- 生物聲音不像。
- 聲音太小。

修正：

- 提高預設音量。
- 新增「生物音量」滑桿。
- 加入壓縮器避免破音。
- 新增「擬聲提示」開關，預設開啟。
- 使用 `SpeechSynthesisUtterance` 加入可辨識的擬聲，例如：
  - 狗：汪汪
  - 貓：喵
  - 青蛙：呱呱
  - 牛：哞
  - 羊：咩
  - 狼：嗷嗚
  - 蛇：嘶嘶

相關提交：

```bash
fix: improve biological sound volume
```

## 原理與應用頁互動動畫

使用者要求把「原理與應用」頁(第 6 頁)做成互動動畫。

完成內容：

- 三張概念卡由靜態 SVG 改為即時 Canvas 互動動畫，由 `conceptDemoMarkup` / `initInteractiveConcepts` / `drawConceptDemo` 處理。
  - 頻率決定音高：滑桿(80–1200 Hz)即時改變行進波密度與顏色，附「試聽」鈕。
  - 振幅影響音量：滑桿(0–100%)改變波形高度，畫出振幅上下界，附「試聽」鈕。
  - 頻譜像聲音指紋：會跳動的等化器，可切換 低音鼓／人聲／鳥鳴／白噪音 四種頻譜輪廓。
- 試聽用 `playDemoTone`(振盪器 + 壓縮器 + 包絡)。
- 動畫只在該頁可見時繪製(`canvas.offsetParent` 判斷)。
- 「生活應用」的六張卡仍為靜態 SVG。

相關提交：

```bash
feat: turn principle cards into interactive animations
```

## 闖關題目與自主學習 logo

使用者要求：闖關題增加到 10 題；自主學習卡片改用各網站 logo（去背、與背景融合）。

闖關題：

- `public/data/quiz.json` 與 `data/quiz.json` 由 5 題增為 10 題（素養導向，含聲音傳遞、單位、聽力保護等）。

自主學習 logo：

- 各網站 logo 去背後存於 `public/img/resources/`，對應記於同資料夾 `manifest.json`。
- 來源：PhET（官方透明 PNG）、教育百科（白色字標）、CDC（Wikimedia「CDC logo 2024.png」透明版）、MDN（apple-touch 黑底白字，用亮度去背成白色字標）、Science Learning Hub（apple-touch 去背）。
- 去背方式：角落洪水填充移除純色底；MDN 這類白字黑底改用亮度鍵（黑→透明、白→保留）。
- `js/app.js` 以 `resourceSlug` / `loadResourceLogos` / `resourceVisual` 渲染：有 logo 就顯示去背圖，沒有就退回原本 `miniSvg("spectrum")`。
- 中央氣象署（cwa.gov.tw）：用其 Win10 磁貼標誌 `cwbPinlogo310.png`（藍底白橢圓內含海浪），程式去背只保留白色海浪剪影。該站憑證有問題（Missing Subject Key Identifier）會擋住 Python 抓取，需用 `ssl._create_unverified_context()` 並帶 `Referer` 才能取得資產。
- CSS `.resource-logo` 用透明容器 + `object-fit: contain` + drop-shadow，讓 logo 融入深色卡片。

相關提交：

```bash
feat: 10-question quiz and de-backgrounded site logos
```

## 目前重要檔案

- `index.html`：網站頁籤與主要介面
- `css/style.css`：整體視覺、RWD、控制元件樣式
- `js/app.js`：Web Audio、Canvas、麥克風、媒體分析、遊戲邏輯
- `public/data/*.json`：GitHub Pages 實際部署用資料
- `data/*.json`：原始資料副本
- `.github/workflows/pages.yml`：GitHub Pages 自動部署
- `docs/test-report.md`：每次修正與測試紀錄

## 本機開發方式

安裝依賴：

```bash
npm install
```

啟動本機伺服器：

```bash
npm run start
```

建置：

```bash
npm run build
```

GitHub Pages 模式建置：

```powershell
$env:GITHUB_PAGES='true'
npm run build
Remove-Item Env:GITHUB_PAGES
```

## 部署流程

目前部署由 GitHub Actions 自動完成。

一般流程：

```bash
git add .
git commit -m "message"
git push
```

推送到 `main` 後，GitHub Actions 會：

1. 安裝 Node.js
2. 執行 `npm ci`
3. 執行 `npm run build`
4. 上傳 `dist`
5. 部署到 GitHub Pages

## 已知限制

### 麥克風

- 需要 HTTPS 或 localhost。
- 需要瀏覽器授權。
- 若 Chrome 授權但圖譜沒動，需要確認：
  - Chrome 使用的輸入裝置
  - Windows 音效輸入音量
  - 網頁中的麥克風裝置選單
  - `訊號振幅` 是否大於 2

### YouTube 分析

- 不能直接讀取 YouTube iframe 的聲音。
- 需要使用「分析 YouTube 聲音」並由使用者在 Chrome 分享視窗選擇分頁。
- 必須勾選「分享分頁音訊」。

### 生物聲音

- 已改為真實錄音：22 種生物各對應一個音檔，放在 `public/audio/bio/`。
- 來源以 Wikimedia Commons（公有領域 / 創用 CC）為主，少數採 Google Sound Library。
- 對應關係與授權記錄在 `public/audio/bio/manifest.json`，並產生 `public/audio/bio/CREDITS.md` 供標示出處。
- 前端載入 `manifest.json` 後，用 `HTMLAudioElement` 接到 Web Audio 的 gain 與壓縮器播放，沿用「生物音量」滑桿。
- 每段最多播放 5 秒（`BIO_MAX_SECONDS`），避免鯨魚、海豚等長音檔過長。
- 若某音檔載入或播放失敗，會自動退回原本的 Web Audio 合成音（`synthBiologicalSound`）。
- 「擬聲提示」改為選用、預設關閉；勾選後會在真實聲音之後加上語音擬聲。
- `dolphin.wav` 約 6MB 為最大檔，整個 `public/audio/bio` 約 14MB。

## 最新狀態

截至最後一次整理：

- 網站名稱：聲音實驗室
- GitHub Pages 已可用
- 資料頁籤已修復
- 頻率偵探音量已加強
- 生物聲音猜猜看已取代靜音任務
- 生物聲音已改為真實錄音（`public/audio/bio/`），合成音保留為後援

