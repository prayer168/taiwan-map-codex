const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const tabPosition = document.querySelector("#tabPosition");
const visited = new Set(JSON.parse(localStorage.getItem("audioLabVisited") || "[\"mission\"]"));

let audioContext;
let oscillator;
let toneGain;
let sweepTimer;
let micStream;
let micSource;
let micAnalyser;
let mediaSource;
let mediaAnalyser;
let mediaConnected = false;
let challengeAnswer = null;
let quietStart = null;
let quietGameActive = false;

const canvases = {
  tone: document.querySelector("#toneCanvas"),
  mic: document.querySelector("#micCanvas"),
  media: document.querySelector("#mediaCanvas")
};

const ctxs = Object.fromEntries(Object.entries(canvases).map(([key, canvas]) => [key, canvas.getContext("2d")]));

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function switchTab(id) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === id));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === id));
  visited.add(id);
  localStorage.setItem("audioLabVisited", JSON.stringify([...visited]));
  updateProgress();
  document.querySelector(`#${id}`).focus({ preventScroll: true });
}

function updateProgress() {
  const activeIndex = tabs.findIndex((tab) => tab.classList.contains("active"));
  const percent = Math.round((visited.size / tabs.length) * 100);
  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  tabPosition.textContent = `${activeIndex + 1} / ${tabs.length}`;
}

tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.go));
});
document.querySelector("#prevTab").addEventListener("click", () => {
  const index = tabs.findIndex((tab) => tab.classList.contains("active"));
  switchTab(tabs[Math.max(0, index - 1)].dataset.tab);
});
document.querySelector("#nextTab").addEventListener("click", () => {
  const index = tabs.findIndex((tab) => tab.classList.contains("active"));
  switchTab(tabs[Math.min(tabs.length - 1, index + 1)].dataset.tab);
});

function drawGrid(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#050a12";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#162841";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawToneWave() {
  const canvas = canvases.tone;
  const ctx = ctxs.tone;
  const frequency = Number(document.querySelector("#frequencyInput").value);
  const volume = Number(document.querySelector("#volumeRange").value);
  drawGrid(ctx, canvas.width, canvas.height);
  ctx.lineWidth = 4;
  ctx.strokeStyle = frequency > 12000 ? "#ffbf3f" : frequency > 2000 ? "#4e8cff" : "#18b6a2";
  ctx.beginPath();
  const cycles = Math.max(0.5, Math.min(28, frequency / 360));
  const amp = 36 + volume * 520;
  for (let x = 0; x < canvas.width; x += 2) {
    const y = canvas.height / 2 + Math.sin((x / canvas.width) * cycles * Math.PI * 2) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#e9f2ff";
  ctx.font = "22px Microsoft JhengHei, sans-serif";
  ctx.fillText(`${frequency.toLocaleString()} Hz`, 28, 42);
  requestAnimationFrame(drawToneWave);
}

function updateToneLabels() {
  const frequency = Number(document.querySelector("#frequencyInput").value);
  document.querySelector("#currentFrequency").textContent = `${frequency.toLocaleString()} Hz`;
  document.querySelector("#waveLabel").textContent = frequency < 300 ? "波距長" : frequency < 2000 ? "中等" : "波距短";
  document.querySelector("#pitchLabel").textContent =
    frequency < 80 ? "接近低頻震動" :
    frequency < 300 ? "低沉" :
    frequency < 2000 ? "清楚可辨" :
    frequency < 9000 ? "尖亮" :
    "極高頻";
  if (oscillator) oscillator.frequency.setTargetAtTime(Math.max(1, frequency), audioContext.currentTime, 0.01);
}

function setFrequency(value) {
  const next = Math.min(30000, Math.max(0, Number(value) || 0));
  document.querySelector("#frequencyInput").value = next;
  document.querySelector("#frequencyRange").value = next;
  updateToneLabels();
}

document.querySelector("#frequencyRange").addEventListener("input", (event) => setFrequency(event.target.value));
document.querySelector("#setFrequency").addEventListener("click", () => setFrequency(document.querySelector("#frequencyInput").value));
document.querySelectorAll("[data-frequency]").forEach((button) => {
  button.addEventListener("click", () => setFrequency(button.dataset.frequency));
});
document.querySelector("#volumeRange").addEventListener("input", (event) => {
  if (toneGain) toneGain.gain.setTargetAtTime(Number(event.target.value), audioContext.currentTime, 0.02);
});

function stopTone() {
  clearInterval(sweepTimer);
  sweepTimer = null;
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

document.querySelector("#playTone").addEventListener("click", () => {
  stopTone();
  const context = ensureAudio();
  oscillator = context.createOscillator();
  toneGain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = Math.max(1, Number(document.querySelector("#frequencyInput").value));
  toneGain.gain.value = Number(document.querySelector("#volumeRange").value);
  oscillator.connect(toneGain).connect(context.destination);
  oscillator.start();
});
document.querySelector("#stopTone").addEventListener("click", stopTone);
document.querySelector("#sweepTone").addEventListener("click", () => {
  document.querySelector("#playTone").click();
  let value = 120;
  clearInterval(sweepTimer);
  sweepTimer = setInterval(() => {
    value += 120;
    setFrequency(value);
    if (value >= 6000) {
      clearInterval(sweepTimer);
      sweepTimer = null;
    }
  }, 120);
});

function rmsToDb(data) {
  let sum = 0;
  for (const value of data) {
    const centered = (value - 128) / 128;
    sum += centered * centered;
  }
  const rms = Math.sqrt(sum / data.length);
  return Math.max(0, Math.min(100, 20 * Math.log10(rms || 0.00001) + 100));
}

function drawSpectrum(canvas, ctx, analyser, mode = "bars") {
  const data = new Uint8Array(analyser.frequencyBinCount);
  const timeData = new Uint8Array(analyser.fftSize);
  analyser.getByteFrequencyData(data);
  analyser.getByteTimeDomainData(timeData);
  drawGrid(ctx, canvas.width, canvas.height);
  const barWidth = canvas.width / data.length;
  let max = 0;
  let maxIndex = 0;
  let highEnergy = 0;
  let lowEnergy = 0;
  data.forEach((value, index) => {
    if (value > max) {
      max = value;
      maxIndex = index;
    }
    if (index < data.length * 0.16) lowEnergy += value;
    if (index > data.length * 0.55) highEnergy += value;
    const height = (value / 255) * canvas.height * 0.82;
    const hue = mode === "media" ? 170 + (index / data.length) * 120 : 170 - (index / data.length) * 80;
    ctx.fillStyle = `hsl(${hue}, 86%, ${42 + value / 8}%)`;
    ctx.fillRect(index * barWidth, canvas.height - height, Math.max(1, barWidth - 1), height);
  });
  if (mode === "media") {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255, 191, 63, 0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < timeData.length; i += 4) {
      const x = (i / timeData.length) * canvas.width;
      const y = canvas.height * 0.46 + ((timeData[i] - 128) / 128) * 90;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }
  const db = rmsToDb(timeData);
  const peakFrequency = Math.round((maxIndex * audioContext.sampleRate) / analyser.fftSize);
  return { db, peakFrequency, lowEnergy, highEnergy, max };
}

async function startMic() {
  const context = ensureAudio();
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  micSource = context.createMediaStreamSource(micStream);
  micAnalyser = context.createAnalyser();
  micAnalyser.fftSize = 2048;
  micSource.connect(micAnalyser);
  document.querySelector("#micStatus").textContent = "麥克風已啟用，請試著拍手、說話或播放一段音樂。";
}

function stopMic() {
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
  }
  micStream = null;
  micSource = null;
  micAnalyser = null;
  document.querySelector("#micStatus").textContent = "麥克風已停止。";
}

document.querySelector("#startMic").addEventListener("click", async () => {
  try {
    await startMic();
  } catch (error) {
    document.querySelector("#micStatus").textContent = `無法開啟麥克風：${error.message}`;
  }
});
document.querySelector("#stopMic").addEventListener("click", stopMic);

function animateMic() {
  if (micAnalyser && !document.querySelector("#freezeMic").checked) {
    const result = drawSpectrum(canvases.mic, ctxs.mic, micAnalyser);
    document.querySelector("#dbValue").textContent = `${result.db.toFixed(1)} dB`;
    document.querySelector("#peakFrequency").textContent = `${result.peakFrequency} Hz`;
    document.querySelector("#dbFill").style.height = `${result.db}%`;
    document.querySelector("#soundState").textContent = result.db < 35 ? "安靜" : result.db < 68 ? "一般聲音" : "偏大聲";
    updateQuietGame(result.db);
  } else if (!micAnalyser) {
    drawIdle(canvases.mic, ctxs.mic, "等待麥克風");
  }
  requestAnimationFrame(animateMic);
}

const mediaPlayer = document.querySelector("#mediaPlayer");
document.querySelector("#mediaFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) mediaPlayer.src = URL.createObjectURL(file);
});
document.querySelector("#loadUrl").addEventListener("click", () => {
  const url = document.querySelector("#mediaUrl").value.trim();
  if (url) mediaPlayer.src = url;
});
document.querySelector("#playMedia").addEventListener("click", async () => {
  const context = ensureAudio();
  if (!mediaConnected) {
    mediaSource = context.createMediaElementSource(mediaPlayer);
    mediaAnalyser = context.createAnalyser();
    mediaAnalyser.fftSize = 2048;
    mediaSource.connect(mediaAnalyser).connect(context.destination);
    mediaConnected = true;
  }
  await mediaPlayer.play();
});
document.querySelector("#pauseMedia").addEventListener("click", () => mediaPlayer.pause());

function animateMedia() {
  if (mediaAnalyser) {
    const result = drawSpectrum(canvases.media, ctxs.media, mediaAnalyser, "media");
    document.querySelector("#beatEnergy").textContent = result.lowEnergy > 22000 ? "強" : result.lowEnergy > 9000 ? "中" : "弱";
    document.querySelector("#brightnessValue").textContent = result.highEnergy > 28000 ? "明亮" : result.highEnergy > 13000 ? "普通" : "溫和";
  } else {
    drawIdle(canvases.media, ctxs.media, "等待媒體播放");
  }
  requestAnimationFrame(animateMedia);
}

function drawIdle(canvas, ctx, label) {
  drawGrid(ctx, canvas.width, canvas.height);
  ctx.fillStyle = "#a8b8cc";
  ctx.font = "24px Microsoft JhengHei, sans-serif";
  ctx.fillText(label, 28, 46);
}

function playChallengeTone(frequency) {
  const context = ensureAudio();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.frequency.value = frequency;
  osc.type = "triangle";
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.2);
  osc.connect(gain).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 1.25);
}

document.querySelector("#newChallenge").addEventListener("click", () => {
  const bank = [
    { key: "low", min: 80, max: 300 },
    { key: "mid", min: 300, max: 2000 },
    { key: "high", min: 2000, max: 9000 },
    { key: "ultra", min: 9000, max: 15000 }
  ];
  const item = bank[Math.floor(Math.random() * bank.length)];
  const frequency = Math.round(item.min + Math.random() * (item.max - item.min));
  challengeAnswer = item.key;
  playChallengeTone(frequency);
  document.querySelector("#gameFeedback").textContent = "請選出你聽到的頻率範圍。";
});
document.querySelector("#frequencyChoices").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !challengeAnswer) return;
  document.querySelector("#gameFeedback").textContent =
    button.dataset.choice === challengeAnswer ? "答對了！你的耳朵抓到頻率線索。" : "再試一次。可以注意聲音是沉、清楚、尖，還是幾乎聽不到。";
});

document.querySelector("#startQuietGame").addEventListener("click", () => {
  quietGameActive = true;
  quietStart = null;
  document.querySelector("#quietFeedback").textContent = "任務開始，試著讓環境安靜下來。";
});

function updateQuietGame(db) {
  if (!quietGameActive) return;
  const target = Number(document.querySelector("#quietTarget").value);
  if (db <= target) {
    quietStart ??= performance.now();
  } else {
    quietStart = null;
  }
  const elapsed = quietStart ? (performance.now() - quietStart) / 1000 : 0;
  document.querySelector("#quietTimer").textContent = `${elapsed.toFixed(1)}s`;
  document.querySelector("#quietRing").style.background = `conic-gradient(var(--teal) ${Math.min(1, elapsed / 5) * 360}deg, #0b1421 0deg)`;
  if (elapsed >= 5) {
    quietGameActive = false;
    document.querySelector("#quietFeedback").textContent = "成功！你完成 5 秒靜音任務。";
  }
}

function miniSvg(type) {
  const common = 'viewBox="0 0 320 180" role="img"';
  const map = {
    frequency: `<svg ${common} aria-label="頻率比較"><rect width="320" height="180" fill="#0b1421"/><path d="M18 96 C58 38 98 38 138 96 S218 154 302 96" fill="none" stroke="#18b6a2" stroke-width="7"/><path d="M18 48 C30 28 42 28 54 48 S78 68 90 48 S114 28 126 48 S150 68 162 48 S186 28 198 48 S222 68 234 48 S258 28 270 48 S294 68 306 48" fill="none" stroke="#ffbf3f" stroke-width="5"/></svg>`,
    amplitude: `<svg ${common} aria-label="振幅比較"><rect width="320" height="180" fill="#0b1421"/><path d="M18 90 C58 72 98 72 138 90 S218 108 302 90" fill="none" stroke="#4e8cff" stroke-width="5"/><path d="M18 92 C58 22 98 22 138 92 S218 158 302 92" fill="none" stroke="#ff5d93" stroke-width="7"/></svg>`,
    spectrum: `<svg ${common} aria-label="頻譜柱狀圖"><rect width="320" height="180" fill="#0b1421"/><g fill="#18b6a2"><rect x="34" y="92" width="22" height="58"/><rect x="70" y="54" width="22" height="96"/><rect x="106" y="78" width="22" height="72"/><rect x="142" y="30" width="22" height="120"/><rect x="178" y="62" width="22" height="88"/><rect x="214" y="104" width="22" height="46"/><rect x="250" y="86" width="22" height="64"/></g></svg>`,
    tuning: `<svg ${common} aria-label="調音叉"><rect width="320" height="180" fill="#0b1421"/><path d="M142 34 V96 Q142 122 160 122 Q178 122 178 96 V34" fill="none" stroke="#ffbf3f" stroke-width="12" stroke-linecap="round"/><path d="M160 122 V154" stroke="#ffbf3f" stroke-width="12" stroke-linecap="round"/><path d="M88 62 C110 42 124 42 136 62M184 62 C206 42 220 42 242 62" fill="none" stroke="#18b6a2" stroke-width="4"/></svg>`,
    noise: `<svg ${common} aria-label="噪音計"><rect width="320" height="180" fill="#0b1421"/><rect x="94" y="48" width="132" height="76" rx="12" fill="#142234" stroke="#4e8cff"/><text x="124" y="96" fill="#e9f2ff" font-size="30">72 dB</text><path d="M74 138 H246" stroke="#ff5d93" stroke-width="10" stroke-linecap="round"/></svg>`,
    speech: `<svg ${common} aria-label="語音波形"><rect width="320" height="180" fill="#0b1421"/><path d="M34 92 Q58 40 82 92 T130 92 T178 92 T226 92 T286 92" fill="none" stroke="#18b6a2" stroke-width="6"/><circle cx="82" cy="92" r="8" fill="#ffbf3f"/><circle cx="178" cy="92" r="8" fill="#ffbf3f"/></svg>`,
    visualizer: `<svg ${common} aria-label="音樂視覺化"><rect width="320" height="180" fill="#0b1421"/><circle cx="160" cy="90" r="44" fill="none" stroke="#4e8cff" stroke-width="10"/><circle cx="160" cy="90" r="72" fill="none" stroke="#18b6a2" stroke-width="4"/><g fill="#ffbf3f"><rect x="42" y="92" width="18" height="54"/><rect x="70" y="64" width="18" height="82"/><rect x="232" y="74" width="18" height="72"/><rect x="260" y="102" width="18" height="44"/></g></svg>`,
    ultrasound: `<svg ${common} aria-label="超音波測距"><rect width="320" height="180" fill="#0b1421"/><rect x="42" y="68" width="58" height="44" rx="8" fill="#142234" stroke="#18b6a2"/><path d="M108 74 C150 42 188 42 228 74M108 92 C158 66 190 66 228 92M108 110 C150 138 188 138 228 110" fill="none" stroke="#ffbf3f" stroke-width="4"/><rect x="242" y="46" width="34" height="88" rx="6" fill="#4e8cff"/></svg>`,
    insulation: `<svg ${common} aria-label="隔音材料"><rect width="320" height="180" fill="#0b1421"/><path d="M40 90 C66 48 92 48 118 90 S170 132 196 90" fill="none" stroke="#ff5d93" stroke-width="5"/><rect x="202" y="36" width="32" height="118" fill="#18b6a2"/><rect x="244" y="36" width="32" height="118" fill="#4e8cff"/><path d="M236 90 C250 78 260 78 276 90" fill="none" stroke="#a8b8cc" stroke-width="4"/></svg>`
  };
  return map[type] || map.spectrum;
}

async function loadContent() {
  const [content, quiz, resources] = await Promise.all([
    fetch("./data/content.json").then((response) => response.json()),
    fetch("./data/quiz.json").then((response) => response.json()),
    fetch("./data/resources.json").then((response) => response.json())
  ]);
  document.querySelector("#conceptGrid").innerHTML = content.concepts.map((item) => `
    <article class="concept-card">${miniSvg(item.visual)}<h3>${item.title}</h3><p>${item.text}</p></article>
  `).join("");
  document.querySelector("#applicationGrid").innerHTML = content.applications.map((item) => `
    <article class="concept-card">${miniSvg(item.visual)}<h3>${item.title}</h3><p>${item.text}</p></article>
  `).join("");
  document.querySelector("#resourceGrid").innerHTML = resources.map((item) => `
    <article class="resource-card">
      ${miniSvg("spectrum")}
      <h3><a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a></h3>
      <p>${item.description}</p>
      <p class="resource-meta">${item.type}｜${item.grade}｜檢查日期 ${item.checkedAt}</p>
    </article>
  `).join("");
  renderQuiz(quiz);
}

function renderQuiz(quiz) {
  const box = document.querySelector("#quizBox");
  box.innerHTML = quiz.map((item, index) => `
    <div class="quiz-item" data-answer="${item.answer}">
      <p><strong>${index + 1}. ${item.question}</strong></p>
      <div class="quiz-options">
        ${item.options.map((option, optionIndex) => `
          <label><input type="radio" name="q${index}" value="${optionIndex}" /> ${option}</label>
        `).join("")}
      </div>
      <p class="answer-note" hidden>${item.explanation}</p>
    </div>
  `).join("");
  document.querySelector("#quizScore").textContent = `0 / ${quiz.length}`;
}

document.querySelector("#checkQuiz").addEventListener("click", () => {
  const items = [...document.querySelectorAll(".quiz-item")];
  let score = 0;
  items.forEach((item, index) => {
    const checked = item.querySelector(`input[name="q${index}"]:checked`);
    const note = item.querySelector(".answer-note");
    const correct = checked && Number(checked.value) === Number(item.dataset.answer);
    if (correct) score += 1;
    note.hidden = false;
    note.style.color = correct ? "var(--green)" : "var(--amber)";
  });
  document.querySelector("#quizScore").textContent = `${score} / ${items.length}`;
});
document.querySelector("#resetQuiz").addEventListener("click", () => {
  document.querySelectorAll(".quiz-item input").forEach((input) => { input.checked = false; });
  document.querySelectorAll(".answer-note").forEach((note) => { note.hidden = true; });
  document.querySelector("#quizScore").textContent = `0 / ${document.querySelectorAll(".quiz-item").length}`;
});

loadContent();
updateProgress();
drawToneWave();
animateMic();
animateMedia();
updateToneLabels();
