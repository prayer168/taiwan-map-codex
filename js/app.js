import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#taiwanScene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111d);
scene.fog = new THREE.FogExp2(0x07111d, 0.008);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 900);
camera.position.set(0, 52, 118);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 18;
controls.maxDistance = 210;
controls.target.set(0, 0, 0);

const root = new THREE.Group();
scene.add(root);

const ui = {
  loading: document.querySelector("#loadingState"),
  cityList: document.querySelector("#cityList"),
  regionFilter: document.querySelector("#regionFilter"),
  focusName: document.querySelector("#focusName"),
  altitudeValue: document.querySelector("#altitudeValue"),
  speedValue: document.querySelector("#speedValue"),
  speedRange: document.querySelector("#speedRange"),
  tourButton: document.querySelector("#tourButton"),
  homeButton: document.querySelector("#homeButton"),
  nightButton: document.querySelector("#nightButton"),
  placeCounty: document.querySelector("#placeCounty"),
  placeTitle: document.querySelector("#placeTitle"),
  placeText: document.querySelector("#placeText"),
  detail: document.querySelector(".place-detail")
};

const palette = {
  north: "#5ea4ff",
  central: "#88dc72",
  south: "#f6c45a",
  east: "#41d7c7",
  islands: "#ff7d9d"
};

const landmarks = [
  { county: "基隆市", region: "north", place: "正濱漁港", x: 8, z: -43, model: "harbor", note: "彩色屋岸線與港灣燈塔，標記北台灣海門。" },
  { county: "臺北市", region: "north", place: "台北 101", x: 1, z: -38, model: "tower101", note: "以摩天樓群呈現信義天際線，是北部最醒目的城市地標。" },
  { county: "新北市", region: "north", place: "野柳女王頭", x: 11, z: -37, model: "rock", note: "海蝕地形與岬角步道，適合觀察東北角海岸。" },
  { county: "桃園市", region: "north", place: "大溪老街", x: -8, z: -34, model: "street", note: "街屋牌樓與河階地形，連接北部丘陵與台地。" },
  { county: "新竹縣市", region: "north", place: "新竹城隍廟", x: -15, z: -27, model: "temple", note: "廟埕與城區模型代表風城生活圈。" },
  { county: "苗栗縣", region: "central", place: "龍騰斷橋", x: -18, z: -18, model: "bridge", note: "磚拱橋與丘陵地貌，呈現鐵道與地震地景。" },
  { county: "臺中市", region: "central", place: "臺中國家歌劇院", x: -15, z: -8, model: "opera", note: "曲牆建築與都會軸線，位於中部盆地核心。" },
  { county: "彰化縣", region: "central", place: "八卦山大佛", x: -21, z: 1, model: "buddha", note: "山丘上的大佛與扇形平原，俯瞰西部聚落。" },
  { county: "南投縣", region: "central", place: "日月潭", x: -2, z: 4, model: "lake", note: "內陸湖泊與環湖山勢，標示台灣中心地景。" },
  { county: "雲林縣", region: "central", place: "北港朝天宮", x: -20, z: 14, model: "temple", note: "媽祖信仰重鎮，與濁水溪沖積平原相鄰。" },
  { county: "嘉義縣市", region: "south", place: "阿里山森林鐵路", x: -10, z: 21, model: "rail", note: "山林鐵道爬升到雲海茶園，是高山旅遊入口。" },
  { county: "臺南市", region: "south", place: "赤崁樓", x: -21, z: 31, model: "fort", note: "古城牆與府城街廓，呈現台灣早期城市記憶。" },
  { county: "高雄市", region: "south", place: "龍虎塔與港灣", x: -15, z: 43, model: "pagoda", note: "蓮池潭塔樓與港口起重機，連結工業城市與觀光湖景。" },
  { county: "屏東縣", region: "south", place: "墾丁鵝鑾鼻", x: -4, z: 59, model: "lighthouse", note: "南端燈塔、珊瑚礁台地與海角，是飛行路線的終點。" },
  { county: "宜蘭縣", region: "east", place: "龜山島海岸", x: 16, z: -24, model: "island", note: "沖積平原外的火山島，標記蘭陽海岸視野。" },
  { county: "花蓮縣", region: "east", place: "太魯閣峽谷", x: 16, z: 5, model: "gorge", note: "大理岩峽谷切穿中央山脈，是東部最具張力的地景。" },
  { county: "臺東縣", region: "east", place: "三仙台", x: 15, z: 38, model: "arch", note: "跨海拱橋與礫石海岸，沿著縱谷南行可抵達。" },
  { county: "澎湖縣", region: "islands", place: "雙心石滬", x: -52, z: 22, model: "fishtrap", note: "玄武岩海岸旁的潮間帶石滬，位於台灣海峽。" },
  { county: "金門縣", region: "islands", place: "莒光樓", x: -72, z: 2, model: "gate", note: "城樓與閩南聚落，放在西側離島群作為空拍節點。" },
  { county: "連江縣", region: "islands", place: "芹壁聚落", x: -58, z: -48, model: "village", note: "石屋聚落與海灣坡地，標示馬祖列島。" },
  { county: "綠島", region: "islands", place: "朝日溫泉", x: 35, z: 39, model: "spring", note: "海岸溫泉與環島公路，是東南外海亮點。" },
  { county: "蘭嶼", region: "islands", place: "拼板舟海岸", x: 43, z: 54, model: "canoe", note: "達悟文化與火山島地形，位於台灣東南方。" }
];

const landmarkObjects = new Map();
const keyState = new Set();
let selected = null;
let autoTour = false;
let tourIndex = 0;
let tourClock = 0;
let isNight = false;
let speedMultiplier = 1;
const cameraGoal = {
  position: camera.position.clone(),
  target: controls.target.clone()
};

const landMaterial = new THREE.MeshStandardMaterial({
  color: 0x2f8f60,
  roughness: 0.82,
  metalness: 0.03
});
const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x486b48, roughness: 0.9 });
const coastMaterial = new THREE.MeshStandardMaterial({ color: 0xf1d38c, roughness: 0.72 });
const cityMaterial = new THREE.MeshStandardMaterial({ color: 0xd9e7f5, roughness: 0.45, metalness: 0.12 });
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x8ff8e8, transparent: true, opacity: 0.35 });

const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-35, 80, 42);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x9fd5ff, 0x173015, 1.7));

function makeTaiwanShape(scale = 1) {
  const pts = [
    [1, -50], [8, -44], [14, -34], [18, -22], [20, -8], [19, 8], [16, 24],
    [13, 38], [8, 51], [2, 63], [-4, 66], [-9, 58], [-12, 45], [-16, 31],
    [-21, 17], [-24, 2], [-24, -13], [-20, -27], [-13, -39], [-5, -47]
  ];
  const shape = new THREE.Shape();
  pts.forEach(([x, z], index) => {
    const px = x * scale;
    const py = z * scale;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  return shape;
}

function makeIsland(x, z, radius, color = 0x3d9566) {
  const geometry = new THREE.CylinderGeometry(radius, radius * 1.18, 1.6, 34);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.82 }));
  mesh.position.set(x, 0.4, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);
  return mesh;
}

function buildBaseMap() {
  const ocean = new THREE.Mesh(
    new THREE.CircleGeometry(190, 96),
    new THREE.MeshStandardMaterial({ color: 0x0b3e5f, roughness: 0.62, metalness: 0.08 })
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -1.15;
  ocean.receiveShadow = true;
  root.add(ocean);

  const landGeometry = new THREE.ExtrudeGeometry(makeTaiwanShape(), { depth: 2.8, bevelEnabled: true, bevelSize: 1.15, bevelThickness: 0.65, bevelSegments: 4 });
  landGeometry.rotateX(Math.PI / 2);
  landGeometry.translate(0, 0.2, 0);
  const island = new THREE.Mesh(landGeometry, landMaterial);
  island.castShadow = true;
  island.receiveShadow = true;
  root.add(island);

  const coastGeometry = new THREE.ShapeGeometry(makeTaiwanShape(1.035));
  coastGeometry.rotateX(-Math.PI / 2);
  const coast = new THREE.Mesh(coastGeometry, coastMaterial);
  coast.position.y = -0.98;
  coast.receiveShadow = true;
  root.add(coast);

  const ridgePoints = [
    [2, -39, 5.8], [5, -28, 8.5], [6, -15, 11], [5, -2, 15], [3, 10, 17],
    [1, 22, 13], [-1, 34, 10], [-3, 48, 7.5]
  ];
  ridgePoints.forEach(([x, z, h], i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(8 - Math.min(i, 5) * 0.35, h, 5),
      mountainMaterial
    );
    cone.position.set(x, h / 2 + 1, z);
    cone.rotation.y = i * 0.42;
    cone.castShadow = true;
    cone.receiveShadow = true;
    root.add(cone);
  });

  makeIsland(-52, 22, 7.5);
  makeIsland(-72, 2, 6.8);
  makeIsland(-58, -48, 5.6);
  makeIsland(35, 39, 4.2);
  makeIsland(43, 54, 5.4);

  addCompassRose();
  addFlightPath();
}

function addCompassRose() {
  const group = new THREE.Group();
  group.position.set(52, 0.05, -58);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.08, 8, 72),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 5, 3),
    new THREE.MeshBasicMaterial({ color: 0xf6c45a })
  );
  arrow.position.z = -4;
  arrow.rotation.x = -Math.PI / 2;
  group.add(arrow);
  root.add(group);
}

function addFlightPath() {
  const points = landmarks.filter((item) => item.region !== "islands").map((item) => new THREE.Vector3(item.x, 2.4, item.z));
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
  const geometry = new THREE.TubeGeometry(curve, 220, 0.11, 8, false);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }));
  root.add(mesh);
}

function cylinder(radius, height, color) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 28),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.04 })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cone(r, h, color) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(r, h, 4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.62 })
  );
  mesh.castShadow = true;
  return mesh;
}

function addLandmarkModel(item) {
  const group = new THREE.Group();
  group.position.set(item.x, 2.5, item.z);
  group.userData = item;
  const color = new THREE.Color(palette[item.region]);

  const marker = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.09, 8, 44), glowMaterial.clone());
  marker.material.color = color;
  marker.rotation.x = Math.PI / 2;
  marker.position.y = 0.05;
  group.add(marker);

  if (item.model === "tower101") {
    for (let i = 0; i < 7; i += 1) {
      const tier = box(2.7 - i * 0.16, 1.2, 2.7 - i * 0.16, 0x9fc7de);
      tier.position.y = 0.65 + i * 1.08;
      group.add(tier);
    }
    const spire = cone(0.55, 3.8, 0xf6c45a);
    spire.position.y = 9.9;
    group.add(spire);
  } else if (item.model === "lake") {
    const lake = new THREE.Mesh(new THREE.CircleGeometry(4.4, 48), new THREE.MeshStandardMaterial({ color: 0x247cc2, roughness: 0.3, metalness: 0.08 }));
    lake.rotation.x = -Math.PI / 2;
    lake.position.y = 0.16;
    lake.scale.set(1.25, 0.72, 1);
    group.add(lake);
    group.add(cone(2.4, 4.5, 0x486b48));
  } else if (item.model === "bridge" || item.model === "arch") {
    for (let i = -2; i <= 2; i += 1) {
      const pier = cylinder(0.22, 2.2, 0xd7b47a);
      pier.position.set(i * 1.15, 1.1, 0);
      group.add(pier);
    }
    const deck = box(6.5, 0.35, 0.75, item.model === "arch" ? 0xd8f1ff : 0xb8694c);
    deck.position.y = 2.15;
    group.add(deck);
  } else if (item.model === "temple" || item.model === "pagoda" || item.model === "gate") {
    const floors = item.model === "pagoda" ? 3 : 2;
    for (let i = 0; i < floors; i += 1) {
      const body = box(3.1 - i * 0.35, 0.95, 2.4 - i * 0.22, 0xc95740);
      body.position.y = 0.55 + i * 1.05;
      group.add(body);
      const roof = cone(2.25 - i * 0.22, 0.75, 0xf6c45a);
      roof.scale.z = 0.72;
      roof.position.y = 1.2 + i * 1.05;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    }
  } else if (item.model === "lighthouse" || item.model === "harbor") {
    const tower = cylinder(0.65, 4.2, 0xf4f7fb);
    tower.position.y = 2.1;
    group.add(tower);
    const cap = cylinder(0.95, 0.55, 0xff7d9d);
    cap.position.y = 4.45;
    group.add(cap);
    group.add(box(4.8, 0.25, 1, 0xd7b47a));
  } else if (item.model === "gorge") {
    const left = cone(2.5, 6, 0x66735d);
    left.position.set(-1.7, 3, 0);
    const right = cone(2.5, 6.5, 0x536956);
    right.position.set(1.7, 3.25, 0);
    const river = box(0.7, 0.12, 5.2, 0x41d7c7);
    river.position.y = 0.2;
    group.add(left, right, river);
  } else if (item.model === "fishtrap") {
    const a = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.12, 8, 36), new THREE.MeshStandardMaterial({ color: 0xd8d2bd }));
    const b = a.clone();
    a.scale.set(1.1, 0.82, 1);
    b.scale.set(1.1, 0.82, 1);
    a.position.x = -0.9;
    b.position.x = 0.9;
    a.rotation.x = b.rotation.x = Math.PI / 2;
    group.add(a, b);
  } else if (item.model === "canoe") {
    const boat = box(4.2, 0.45, 1.05, 0xd04a38);
    boat.position.y = 0.45;
    boat.scale.z = 0.55;
    group.add(boat);
    group.add(box(0.2, 2.4, 0.2, 0xf4f7fb));
  } else if (item.model === "spring") {
    const pool = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.22, 10, 40), new THREE.MeshStandardMaterial({ color: 0x41d7c7 }));
    pool.rotation.x = Math.PI / 2;
    group.add(pool);
    for (let i = 0; i < 3; i += 1) {
      const steam = cylinder(0.06, 2.1, 0xd8f1ff);
      steam.position.set(-0.7 + i * 0.7, 1.2, 0.2);
      group.add(steam);
    }
  } else if (item.model === "rail") {
    group.add(box(5.2, 0.18, 0.18, 0xe6e0cf), box(5.2, 0.18, 0.18, 0xe6e0cf));
    group.children[1].position.z = 0.7;
    group.children[2].position.z = -0.7;
    const train = box(1.5, 0.75, 1, 0xff7d9d);
    train.position.y = 0.55;
    group.add(train);
  } else if (item.model === "opera") {
    const hall = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), cityMaterial);
    hall.scale.set(1.45, 0.82, 1);
    hall.position.y = 0.55;
    group.add(hall);
  } else if (item.model === "rock") {
    const rock = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 2.8, 8, 18), new THREE.MeshStandardMaterial({ color: 0xc7b78f, roughness: 0.95 }));
    rock.position.y = 1.65;
    group.add(rock);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 22, 14), rock.material);
    head.position.y = 3.35;
    group.add(head);
  } else {
    group.add(box(2.6, 1.5, 2.2, 0x9fc7de), cone(2, 1.2, 0xf6c45a));
  }

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 8, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }));
  beam.position.y = 4;
  group.add(beam);

  root.add(group);
  landmarkObjects.set(item.county, group);
}

function renderCityList() {
  const filter = ui.regionFilter.value;
  ui.cityList.innerHTML = "";
  landmarks
    .filter((item) => filter === "all" || item.region === filter)
    .forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "city-button";
      button.dataset.county = item.county;
      button.style.setProperty("--city-color", palette[item.region]);
      button.innerHTML = `<span class="city-dot"></span><span><strong>${item.county}</strong><span>${item.place}</span></span>`;
      button.addEventListener("click", () => focusLandmark(item));
      ui.cityList.append(button);
    });
  updateActiveCity();
}

function updateActiveCity() {
  document.querySelectorAll(".city-button").forEach((button) => {
    button.classList.toggle("active", selected?.county === button.dataset.county);
  });
}

function focusLandmark(item) {
  selected = item;
  autoTour = false;
  ui.tourButton.classList.remove("active");
  const object = landmarkObjects.get(item.county);
  const target = object.position.clone();
  const offset = new THREE.Vector3(item.x > 0 ? 17 : -17, 18, item.z > 12 ? 24 : -24);
  cameraGoal.target.copy(target);
  cameraGoal.position.copy(target).add(offset);
  ui.focusName.textContent = item.county;
  ui.placeCounty.textContent = item.county;
  ui.placeTitle.textContent = item.place;
  ui.placeText.textContent = item.note;
  ui.detail.classList.add("is-visible");
  updateActiveCity();
}

function goHome() {
  selected = null;
  autoTour = false;
  if (window.innerWidth < 700) {
    cameraGoal.position.set(0, 135, 12);
  } else {
    cameraGoal.position.set(0, 60, 122);
  }
  cameraGoal.target.set(0, 0, 5);
  camera.position.copy(cameraGoal.position);
  controls.target.copy(cameraGoal.target);
  ui.focusName.textContent = "自由飛行";
  ui.placeCounty.textContent = "DRONE VIEW";
  ui.placeTitle.textContent = "自由瀏覽台灣";
  ui.placeText.textContent = "選擇縣市地標，鏡頭會飛到對應位置。每個地標以立體模型呈現，適合課堂導覽、地理介紹與台灣印象探索。";
  ui.detail.classList.remove("is-visible");
  updateActiveCity();
}

function toggleNight() {
  isNight = !isNight;
  scene.background.set(isNight ? 0x030711 : 0x07111d);
  scene.fog.color.set(isNight ? 0x030711 : 0x07111d);
  sun.intensity = isNight ? 0.55 : 3.2;
  ui.nightButton.classList.toggle("active", isNight);
}

function handleKeyboard(delta) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const amount = 18 * delta * speedMultiplier;
  const movement = new THREE.Vector3();
  if (keyState.has("ArrowUp")) movement.add(forward);
  if (keyState.has("ArrowDown")) movement.sub(forward);
  if (keyState.has("ArrowRight")) movement.add(right);
  if (keyState.has("ArrowLeft")) movement.sub(right);
  if (keyState.has("KeyE")) movement.y += 1;
  if (keyState.has("KeyQ")) movement.y -= 1;
  if (movement.lengthSq() > 0) {
    autoTour = false;
    ui.tourButton.classList.remove("active");
    movement.normalize().multiplyScalar(amount);
    cameraGoal.position.add(movement);
    cameraGoal.target.add(movement);
  }
}

function updateTour(delta) {
  if (!autoTour) return;
  tourClock += delta * speedMultiplier;
  if (tourClock > 5.2) {
    tourClock = 0;
    tourIndex = (tourIndex + 1) % landmarks.length;
    focusLandmark(landmarks[tourIndex]);
    autoTour = true;
    ui.tourButton.classList.add("active");
  }
}

function resize() {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(0.05, clock.getDelta());
  handleKeyboard(delta);
  updateTour(delta);
  camera.position.lerp(cameraGoal.position, 0.035);
  controls.target.lerp(cameraGoal.target, 0.045);
  controls.update();
  root.traverse((object) => {
    if (object.userData?.place) object.rotation.y += delta * 0.5;
  });
  ui.altitudeValue.textContent = `${Math.max(0, Math.round(camera.position.y * 95)).toLocaleString()} m`;
  renderer.render(scene, camera);
}

buildBaseMap();
landmarks.forEach(addLandmarkModel);
renderCityList();
goHome();

ui.regionFilter.addEventListener("change", renderCityList);
ui.homeButton.addEventListener("click", goHome);
ui.nightButton.addEventListener("click", toggleNight);
ui.tourButton.addEventListener("click", () => {
  autoTour = !autoTour;
  ui.tourButton.classList.toggle("active", autoTour);
  if (autoTour) {
    tourClock = 9;
  }
});
ui.speedRange.addEventListener("input", () => {
  speedMultiplier = Number(ui.speedRange.value);
  ui.speedValue.textContent = `${speedMultiplier.toFixed(1)}x`;
});

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyQ", "KeyE"].includes(event.code)) {
    event.preventDefault();
  }
  keyState.add(event.code);
});
window.addEventListener("keyup", (event) => keyState.delete(event.code));
window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(canvas);
renderer.domElement.addEventListener("pointerdown", () => {
  autoTour = false;
  ui.tourButton.classList.remove("active");
});

const clock = new THREE.Clock();
resize();
setTimeout(resize, 120);
ui.loading.classList.add("hidden");
animate();
