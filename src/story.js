let titleImg;
let prologueImgs = [];
let middleImgs = [];
let trueEndingImgs = [];
let ending4Img;

const ASSET_PATH = "";

const titleFile = "title_png.png";

const prologueFiles = [
  "prolouge1_png.png",
  "prolouge2_png.png",
  "prolouge3_png.png",
  "prolouge4_png.png",
  "prolouge5_png.png",
  "prolouge6_png.png"
];

const middleFiles = [
  "middle1_png.png",
  "middle2_png.png",
  "middle3_png.png",
  "middle4_png.png"
];

const trueEndingFiles = [
  "trueEnding1_png.png",
  "trueEnding2_png.png",
  "trueEnding3_png.png",
  "trueEnding4_png.png"
];

const ending4File = "ending4.png";

const gameW = 1086;
const gameH = 1448;

let canvasW;
let canvasH;
let offsetX = 0;
let offsetY = 0;
let scaleRatio = 1;

let currentScreen = "title";

let buttons = [];

let storyData = [];
let prologueData = [];
let middleData = [];
let trueEndingData = [];

let currentPage = 0;
let currentCut = 0;
let cutStartFrame = 0;
let instantText = false;

let nextScreenAfterStory = "heavenReady";

const TEXT_SPEED = 0.36;

let storyAutoMode = false;
let albumDataLoaded = false;
let albumSelectedEnding = null;
let readyScreenEnterFrame = 0;
let unlockedEndings = { ending1: false, ending2: false, ending3: false, ending4: false };
let storyTextScale = 1.0;
let defaultAutoStory = false;
let highContrastText = false;
let howPage = 0;

const storyControlButtons = [
  { name: 'back', label: '뒤로', x: gameW - 285, y: gameH - 206, w: 92, h: 38 },
  { name: 'skip', label: '스킵', x: gameW - 185, y: gameH - 206, w: 92, h: 38 },
  { name: 'auto', label: '빨리', x: gameW - 85, y: gameH - 206, w: 92, h: 38 }
];

function preloadStory() {
  titleImg = loadImage(
    ASSET_PATH + titleFile,
    () => console.log(titleFile + " 로딩 성공"),
    () => console.log(titleFile + " 로딩 실패")
  );

  for (let i = 0; i < prologueFiles.length; i++) {
    prologueImgs[i] = loadImage(
      ASSET_PATH + prologueFiles[i],
      () => console.log(prologueFiles[i] + " 로딩 성공"),
      () => console.log(prologueFiles[i] + " 로딩 실패")
    );
  }

  for (let i = 0; i < middleFiles.length; i++) {
    middleImgs[i] = loadImage(
      ASSET_PATH + middleFiles[i],
      () => console.log(middleFiles[i] + " 로딩 성공"),
      () => console.log(middleFiles[i] + " 로딩 실패")
    );
  }

  for (let i = 0; i < trueEndingFiles.length; i++) {
    trueEndingImgs[i] = loadImage(
      ASSET_PATH + trueEndingFiles[i],
      () => console.log(trueEndingFiles[i] + " 로딩 성공"),
      () => console.log(trueEndingFiles[i] + " 로딩 실패")
    );
  }

  ending4Img = loadImage(
    ASSET_PATH + ending4File,
    () => console.log(ending4File + " 로딩 성공"),
    () => console.log(ending4File + " 로딩 실패")
  );
}

function setupStory() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  imageMode(CORNER);

  makeButtons();
  makePrologueData();
  makeMiddleData();
  makeTrueEndingData();

  storyData = prologueData;
}

function drawStory() {
  background(10);

  updateGameScreenSize();

  push();
  translate(offsetX, offsetY);
  scale(scaleRatio);

  if (currentScreen === "title") {
    drawTitleScreen();
  } else if (currentScreen === "how") {
    drawHowToPlayScreen();
  } else if (currentScreen === "story") {
    drawStoryScreen();
    updateStoryAutoPlay();
  } else if (currentScreen === "album") {
    drawAlbumScreen();
  } else if (currentScreen === "settings") {
    drawSettingsScreen();
  } else if (currentScreen === "heavenReady") {
    drawHeavenReadyScreen();
  } else if (currentScreen === "earthReady") {
    drawEarthReadyScreen();
  } else if (currentScreen === "ending4") {
    drawEnding4Screen();
  }

  pop();
}

function updateGameScreenSize() {
  let targetRatio = gameW / gameH;
  let windowRatio = windowWidth / windowHeight;

  if (windowRatio > targetRatio) {
    canvasH = windowHeight;
    canvasW = canvasH * targetRatio;
  } else {
    canvasW = windowWidth;
    canvasH = canvasW / targetRatio;
  }

  scaleRatio = canvasW / gameW;
  offsetX = (windowWidth - canvasW) / 2;
  offsetY = (windowHeight - canvasH) / 2;
}

function drawCoverImage(img, x, y, w, h) {
  if (!img || img.width === 0) return;

  let imgRatio = img.width / img.height;
  let boxRatio = w / h;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sw = img.width;
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }

  image(img, x, y, w, h, sx, sy, sw, sh);
}

function drawTitleScreen() {
  drawCoverImage(titleImg, 0, 0, gameW, gameH);

  noStroke();
  fill(0, 35);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  drawGameTitle();
  drawButtons();
  drawCreatorNames();
}


function drawCreatorNames() {
  textFont("serif");
  textAlign(RIGHT, CENTER);
  noStroke();
  fill(255, 244, 225, 170);
  textSize(18);
  text("제작자  권솔민 · 정은지 · 이은교", gameW - 38, gameH - 38);
  textAlign(CENTER, CENTER);
}

function drawGameTitle() {
  textFont("serif");

  fill(255, 246, 230);
  stroke(75, 60, 90);
  strokeWeight(3);

  textSize(86);
  text("다시,", gameW / 2, 300);

  textSize(96);
  text("너를 만나러", gameW / 2, 420);

  noStroke();
  fill(245, 232, 215);
  textSize(30 * storyTextScale);
  text("떠난 고양이의 마지막 여행", gameW / 2, 515);

  stroke(245, 232, 215, 180);
  strokeWeight(2);
  line(gameW / 2 - 190, 565, gameW / 2 - 45, 565);
  line(gameW / 2 + 45, 565, gameW / 2 + 190, 565);

  noStroke();
  fill(245, 232, 215, 190);
  textSize(20);
  text("✦", gameW / 2, 565);
}

function makeButtons() {
  loadAlbumData();

  buttons = [
    { name: "start", label: "시작", x: gameW / 2, y: 1080, w: 310, h: 64 },
    { name: "how", label: "게임 방법", x: gameW / 2, y: 1165, w: 310, h: 64 },
    { name: "album", label: "기억 앨범", x: gameW / 2, y: 1250, w: 310, h: 64 },
    { name: "option", label: "설정", x: gameW / 2, y: 1335, w: 310, h: 64 }
  ];
}

function drawButtons() {
  textFont("serif");

  for (let b of buttons) {
    let hover = isMouseOnButton(b);

    if (hover) {
      fill(255, 247, 225, 230);
      stroke(90, 70, 105);
      strokeWeight(3);
    } else {
      fill(255, 247, 225, 115);
      stroke(255, 240, 220, 160);
      strokeWeight(2);
    }

    rect(b.x, b.y, b.w, b.h, 22);

    noStroke();

    if (hover) fill(70, 55, 85);
    else fill(255, 240, 225);

    textSize(34);
    text(b.label, b.x, b.y + 1);
  }
}









function drawHowToPlayScreen() {
  drawCoverImage(titleImg, 0, 0, gameW, gameH);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  noStroke();
  fill(0, 170);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  textFont("serif");
  fill(255, 245, 230);
  textSize(56);
  text(howPage === 0 ? "게임 방법 1 / 2" : "게임 방법 2 / 2", gameW / 2, 92);

  textFont("Noto Sans KR, Pretendard, sans-serif");
  fill(255, 245, 230, 210);
  textSize(22);
  text(howPage === 0 ? "천국 스테이지 설명" : "지상 스테이지 설명", gameW / 2, 145);

  drawHowMainFrame();

  if (howPage === 0) {
    drawHowHeavenPage();
  } else {
    drawHowEarthPage();
  }

  drawHowNavButtons();
}

function drawHowMainFrame() {
  // 큰 네모창 기준: 내부 콘텐츠가 이 박스 안에서만 정렬되도록 고정
  noStroke();
  fill(255, 250, 236, 244);
  rect(gameW / 2, 735, 860, 1080, 34);

  stroke(255, 255, 255, 165);
  strokeWeight(2);
  noFill();
  rect(gameW / 2, 735, 836, 1056, 28);
}

function drawHowHeavenPage() {
  let leftX = gameW / 2 - 200;
  let rightX = gameW / 2 + 200;

  drawHowHeroCard(gameW / 2, 300, "천국 스테이지", "기억조각 / 별조각 18개를 모아\n지상문 안으로 정확히 들어가면 됩니다.", "memory");

  drawHowStatusCard(leftX, 535, "화면 표시", [
    "하트 3개 = 체력",
    "기억 게이지 = 18개 / 100%",
    "남은 시간 = 3분",
    "ESC / 설정 = 일시정지"
  ]);

  drawHowSimpleCard(rightX, 535, 330, 240, "먹고 밟을 것", [
    ["memory", "기억조각 / 별조각", "18개 모으면 문 조건 달성"],
    ["cloud", "하얀 구름", "기본 발판"],
    ["cloudboost", "빛나는 구름", "위로 크게 튕기는 발판"],
    ["heaven", "천국 발판", "안정적인 발판"]
  ]);

  drawHowObstaclePanel(gameW / 2, 880, "천국 장애물", [
    ["storm", "먹구름", "위로 튕김"],
    ["feather", "검은 깃털", "하트 -1 / 위로 튕김"],
    ["rain", "검은비", "하트 -1 / 느려짐"],
    ["shadow", "그림자", "하트 -1 / 옆으로 밀림"]
  ], 2);

  drawHowKnowBox(gameW / 2, 1112, [
    "지상문은 문 안쪽 중앙으로 정확히 들어가야 통과됩니다.",
    "기억조각이 부족한 채 지상문에 닿으면 엔딩1입니다.",
    "하트가 0이 되면 삽화가 나온 뒤 다시하기 / 포기하기 선택지가 나옵니다."
  ]);
}

function drawHowEarthPage() {
  let leftX = gameW / 2 - 200;
  let rightX = gameW / 2 + 200;

  drawHowHeroCard(gameW / 2, 300, "지상 스테이지", "먹어야 하는 아이템은 없고\n장애물을 피해 지상까지 내려가면 됩니다.", "earthset");

  drawHowStatusCard(leftX, 535, "화면 표시", [
    "하트 3개 = 체력",
    "지상 게이지 = 내려간 거리",
    "100% = 지상 도착",
    "ESC / 설정 = 일시정지"
  ]);

  drawHowSimpleCard(rightX, 535, 330, 240, "밟을 발판", [
    ["cloud", "구름", "초반 기본 발판"],
    ["bird", "비둘기 / 작은 새", "공중 발판"],
    ["sign", "간판", "건물 구간 주요 발판"],
    ["plane", "비행기", "밟으면 위로 크게 튕김"]
  ]);

  drawHowObstaclePanel(gameW / 2, 880, "지상 장애물", [
    ["can", "캔", "하트 -1 / 느려짐"],
    ["bottle", "깨진 병", "하트 -2"],
    ["wire", "전선", "하트 -1 / 옆으로 밀림"],
    ["bag", "비닐봉지", "하트 -1 / 위로 튕김"],
    ["gust", "상승기류", "위로 밀림 / 하트 감소 없음"]
  ], 3);

  drawHowKnowBox(gameW / 2, 1112, [
    "지상에서는 기억조각을 먹지 않습니다.",
    "건물 배경이 보이면 새와 간판 발판을 중심으로 내려가면 됩니다.",
    "하트가 0이 되면 삽화가 나온 뒤 다시하기 / 포기하기 선택지가 나옵니다."
  ]);
}

function drawHowHeroCard(x, y, title, desc, iconType) {
  push();
  rectMode(CENTER);
  fill(255, 255, 252, 248);
  stroke(122, 110, 138, 58);
  strokeWeight(2);
  rect(x, y, 740, 150, 28);

  drawHowLargeIcon(iconType, x - 280, y + 6);

  noStroke();
  fill(72, 58, 90);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textAlign(CENTER, CENTER);
  textSize(30);
  text(title, x + 48, y - 28);

  fill(98, 84, 116);
  textSize(17);
  text(desc, x + 48, y + 25);
  pop();
}

function drawHowStatusCard(x, y, title, lines) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Noto Sans KR, Pretendard, sans-serif");

  fill(255, 255, 252, 247);
  stroke(122, 110, 138, 54);
  strokeWeight(1.7);
  rect(x, y, 330, 240, 24);

  noStroke();
  fill(72, 58, 90);
  textSize(23);
  text(title, x, y - 94);

  // 하트와 게이지 예시도 카드 중앙 기준으로 배치
  drawHowMiniHeart(x - 68, y - 50);
  drawHowMiniGauge(x + 8, y - 57, 150, 14);

  fill(104, 90, 118);
  textAlign(CENTER, CENTER);
  textSize(13);
  textLeading(22);

  let startY = y + 4;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, startY + i * 24);
  }

  pop();
}

function drawHowSimpleCard(x, y, w, h, title, rows) {
  push();
  rectMode(CENTER);
  fill(255, 255, 252, 247);
  stroke(122, 110, 138, 54);
  strokeWeight(1.7);
  rect(x, y, w, h, 24);

  noStroke();
  fill(72, 58, 90);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textAlign(CENTER, CENTER);
  textSize(24);
  text(title, x, y - h / 2 + 34);

  let startY = y - 54;
  let gap = rows.length >= 4 ? 47 : 56;
  for (let i = 0; i < rows.length; i++) {
    let yy = startY + i * gap;
    drawHowItemIcon(rows[i][0], x - w / 2 + 62, yy, 0.68);
    textAlign(LEFT, CENTER);
    fill(72, 58, 90);
    textSize(14.5);
    text(rows[i][1], x - w / 2 + 98, yy - 9);
    fill(104, 90, 118);
    textSize(11.5);
    text(rows[i][2], x - w / 2 + 98, yy + 13);
  }
  pop();
}

function drawHowObstaclePanel(x, y, title, rows, cols) {
  push();
  rectMode(CENTER);
  let h = cols === 3 ? 304 : 286;
  fill(255, 255, 252, 247);
  stroke(122, 110, 138, 54);
  strokeWeight(1.7);
  rect(x, y, 740, h, 24);

  noStroke();
  fill(72, 58, 90);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textAlign(CENTER, CENTER);
  textSize(24);
  text(title, x, y - h / 2 + 34);

  let cardW = cols === 3 ? 210 : 315;
  let gapX = cols === 3 ? 225 : 340;
  let startX = x - gapX * (cols - 1) / 2;
  let startY = y - h / 2 + 102;
  let gapY = 88;

  for (let i = 0; i < rows.length; i++) {
    let c = i % cols;
    let r = floor(i / cols);
    drawHowObstacleCard(startX + c * gapX, startY + r * gapY, cardW, rows[i][0], rows[i][1], rows[i][2]);
  }
  pop();
}

function drawHowObstacleCard(x, y, w, type, nameText, desc) {
  push();
  rectMode(CENTER);
  fill(252, 252, 249, 245);
  stroke(122, 110, 138, 34);
  strokeWeight(1.2);
  rect(x, y, w, 74, 16);

  drawHowItemIcon(type, x - w / 2 + 38, y, 0.68);

  noStroke();
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textAlign(LEFT, CENTER);
  fill(72, 58, 90);
  textSize(14.5);
  text(nameText, x - w / 2 + 72, y - 12);

  fill(104, 90, 118);
  textSize(11);
  text(desc, x - w / 2 + 72, y + 14);

  pop();
}

function drawHowKnowBox(x, y, lines) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(101, 87, 122, 225);
  rect(x, y, 700, 102, 22);

  fill(255, 246, 230, 232);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textAlign(CENTER, CENTER);
  textSize(14);
  textLeading(26);
  text(lines.join("\n"), x, y);

  pop();
}

function drawHowNavButtons() {
  drawHowButton(gameW / 2 - 225, 1244, 190, 54, "돌아가기");
  drawHowButton(gameW / 2 + 225, 1244, 190, 54, howPage === 0 ? "지상 보기" : "천국 보기");
}

function drawHowButton(x, y, w, h, label) {
  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);
  let hover = mx > x - w / 2 && mx < x + w / 2 && my > y - h / 2 && my < y + h / 2;

  fill(hover ? color(88, 70, 105, 235) : color(72, 60, 90, 212));
  stroke(255, 245, 220, hover ? 190 : 120);
  strokeWeight(2);
  rect(x, y, w, h, 18);

  noStroke();
  fill(255, 246, 230);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textSize(21);
  textAlign(CENTER, CENTER);
  text(label, x, y);
}

function handleHowClick() {
  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);

  if (mx > gameW / 2 - 320 && mx < gameW / 2 - 130 && my > 1217 && my < 1271) {
    currentScreen = "title";
    return;
  }
  if (mx > gameW / 2 + 130 && mx < gameW / 2 + 320 && my > 1217 && my < 1271) {
    howPage = howPage === 0 ? 1 : 0;
  }
}

function drawHowMiniHeart(x, y) {
  push();
  translate(x, y);
  fill(238, 82, 98);
  noStroke();
  for (let i = 0; i < 3; i++) {
    drawMiniHeartShape(i * 24, 0, 9);
  }
  pop();
}

function drawMiniHeartShape(x, y, s) {
  beginShape();
  vertex(x, y + s * 0.55);
  bezierVertex(x - s * 1.1, y - s * 0.2, x - s * 0.55, y - s * 1.0, x, y - s * 0.45);
  bezierVertex(x + s * 0.55, y - s * 1.0, x + s * 1.1, y - s * 0.2, x, y + s * 0.55);
  endShape(CLOSE);
}

function drawHowMiniGauge(x, y, w, h) {
  push();
  rectMode(CORNER);
  noStroke();
  fill(25, 30, 48, 175);
  rect(x, y, w, h, 8);
  fill(100, 225, 255);
  rect(x, y, w * 0.68, h, 8);
  pop();
}

function drawHowLargeIcon(type, x, y) {
  push();
  if (type === "memory") {
    drawHowMemoryIcon(x, y);
  } else {
    drawHowPlatformIcons(x, y);
  }
  pop();
}

function drawHowMemoryIcon(x, y) {
  push();
  translate(x, y);
  noStroke();
  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = color(255, 220, 70, 220);
  fill(255, 223, 55);
  beginShape();
  vertex(0, -44); vertex(12, -12); vertex(44, 0); vertex(12, 12);
  vertex(0, 44); vertex(-12, 12); vertex(-44, 0); vertex(-12, -12);
  endShape(CLOSE);
  fill(102, 210, 235);
  ellipse(0, 0, 14, 14);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawHowPlatformIcons(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(235, 242, 255);
  ellipse(-28, 8, 86, 26);
  fill(56, 70, 92);
  ellipse(42, 5, 56, 18);
  triangle(28, 5, 8, -8, 20, 12);
  triangle(56, 5, 76, -8, 64, 12);
  fill(102, 76, 68);
  rect(-4, 24, 56, 18, 4);
  fill(235, 208, 136);
  rect(4, 18, 40, 10, 3);
  pop();
}

function drawHowItemIcon(type, x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();

  if (type === "memory") {
    fill(255, 223, 55);
    beginShape();
    vertex(0, -34); vertex(10, -10); vertex(34, 0); vertex(10, 10);
    vertex(0, 34); vertex(-10, 10); vertex(-34, 0); vertex(-10, -10);
    endShape(CLOSE);
    fill(102, 210, 235); ellipse(0, 0, 11, 11);
  } else if (type === "cloud") {
    fill(255);
    ellipse(-20, 5, 34, 22); ellipse(0, 0, 40, 28); ellipse(22, 6, 30, 20);
    fill(225, 236, 252, 190); ellipse(2, 14, 76, 12);
  } else if (type === "cloudboost") {
    fill(255, 255, 248);
    ellipse(-20, 5, 34, 22); ellipse(0, 0, 40, 28); ellipse(22, 6, 30, 20);
    fill(250, 223, 116, 195); ellipse(2, 14, 76, 12);
  } else if (type === "heaven") {
    fill(238, 224, 180); rect(-34, -6, 68, 16, 5); fill(255, 248, 222); rect(-28, -12, 56, 8, 4);
  } else if (type === "bird") {
    fill(74, 84, 104); ellipse(0, 0, 28, 12); triangle(-6, 0, -34, -12, -16, 7); triangle(6, 0, 34, -12, 16, 7);
  } else if (type === "sign") {
    fill(92, 64, 52); rect(-4, 10, 8, 26, 3); fill(100, 68, 126); rect(0, -6, 58, 28, 6); fill(255, 232, 180); rect(0, -6, 42, 12, 4);
  } else if (type === "plane") {
    fill(98, 106, 122); ellipse(0, 0, 66, 14); triangle(-6, 0, -34, -18, -16, 7); triangle(10, 0, 40, -14, 18, 7); rect(-24, -3, 18, 6, 3);
  } else if (type === "storm") {
    fill(18, 22, 30); ellipse(-10, 6, 28, 18); ellipse(6, 0, 32, 24); ellipse(24, 7, 22, 16); fill(70, 78, 98, 190); ellipse(4, -8, 12, 5);
  } else if (type === "feather") {
    fill(15, 18, 26); beginShape(); vertex(0, -24); bezierVertex(12, -8, 12, 14, 0, 24); bezierVertex(-8, 12, -10, -8, 0, -24); endShape(CLOSE); stroke(118, 126, 152); strokeWeight(2); line(0, -22, 0, 22); line(0, -8, 8, -14); line(0, 4, -8, 0); noStroke();
  } else if (type === "rain") {
    fill(18, 28, 45); beginShape(); vertex(0, -24); bezierVertex(13, -8, 12, 10, 0, 24); bezierVertex(-12, 10, -13, -8, 0, -24); endShape(CLOSE); fill(110, 150, 200, 120); ellipse(5, -5, 6, 14);
  } else if (type === "shadow") {
    fill(18, 20, 30); ellipse(-10, 5, 24, 16); ellipse(8, 0, 34, 22); fill(100, 110, 140, 110); ellipse(8, -8, 10, 4);
  } else if (type === "can") {
    fill(188, 194, 204); rect(0, 0, 24, 34, 4); fill(104, 120, 148); rect(0, 0, 20, 10, 3); fill(226, 230, 236); rect(0, -16, 22, 5, 2);
  } else if (type === "bottle") {
    fill(42, 104, 80); rect(0, -16, 12, 10, 2); rect(0, 4, 24, 34, 5); fill(180, 236, 210, 100); rect(6, 2, 5, 18, 2);
  } else if (type === "wire") {
    stroke(20, 22, 28); strokeWeight(4); line(-24, -12, 24, 12); line(-22, 12, 22, -12); noStroke(); fill(24, 26, 34); rect(0, 0, 12, 12, 3);
  } else if (type === "bag") {
    fill(236, 241, 246, 210); rect(0, 0, 30, 24, 6); stroke(198, 208, 224, 170); strokeWeight(3); noFill(); arc(-6, -12, 10, 12, PI, TWO_PI); arc(6, -12, 10, 12, PI, TWO_PI); noStroke();
  } else if (type === "gust") {
    noFill(); stroke(196, 228, 255); strokeWeight(4); arc(-6, 5, 28, 24, HALF_PI, TWO_PI); arc(9, -4, 36, 28, PI, TWO_PI + HALF_PI); noStroke();
  }
  pop();
}


function makeCut(x, y, w, h, text) {
  return { x, y, w, h, text };
}

function makePrologueData() {
  prologueData = [
    {
      img: prologueImgs[0],
      cuts: [
        makeCut(72, 78, 946, 392, "어느 조용한 밤, 작은 고양이는 세상에서 가장 아끼는 파란 방울을 바라보고 있었어요."),
        makeCut(74, 472, 470, 290, "방울은 달빛을 머금은 것처럼 은은하게 빛났고, 고양이의 눈도 함께 반짝였지요."),
        makeCut(548, 470, 471, 291, "고양이는 조심스럽게 앞발을 뻗어, 방울을 톡 하고 건드렸어요."),
        makeCut(75, 764, 504, 288, "그 무렵, 주인은 급한 일이 생겨 서둘러 외출 준비를 하고 있었어요."),
        makeCut(583, 763, 436, 289, "그러는 사이 열린 창문은 그대로 남아 있었답니다."),
        makeCut(76, 1054, 944, 341, "방 안에 홀로 남은 고양이는 다시 방울을 바라보았어요. 그 작은 방울이 긴 여정의 시작이 될 줄은 몰랐지요.")
      ]
    },
    {
      img: prologueImgs[1],
      cuts: [
        makeCut(89, 77, 917, 475, "데굴데굴, 방울은 열린 창문을 향해 굴러가기 시작했어요."),
        makeCut(91, 556, 301, 376, "고양이는 깜짝 놀라 앞발을 뻗었지만, 방울은 조금 더 멀리 굴러갔어요."),
        makeCut(397, 555, 288, 378, "방울은 끝내 창틀을 넘어, 어두운 바깥으로 떨어지고 말았지요."),
        makeCut(690, 556, 316, 376, "고양이는 창밖을 내려다보았어요. 아래에서 방울이 희미하게 반짝이고 있었어요."),
        makeCut(92, 937, 440, 459, "고양이는 그저 소중한 방울을 다시 찾고 싶었을 뿐이었어요."),
        makeCut(535, 937, 471, 459, "그래서 망설임 없이 창밖으로 몸을 날렸고, 빗소리 가득한 밤속으로 사라졌어요.")
      ]
    },
    {
      img: prologueImgs[2],
      cuts: [
        makeCut(46, 71, 994, 353, "비가 쏟아지는 길 위에서도 고양이는 방울을 향해 달려갔어요."),
        makeCut(46, 431, 324, 341, "고양이는 젖은 앞발로 방울을 붙잡으려 했어요."),
        makeCut(376, 431, 288, 341, "작은 방울은 빗물 속에서 딸랑, 하고 흔들렸지요."),
        makeCut(670, 431, 371, 341, "그때, 멀리서 눈부신 불빛이 고양이를 향해 다가왔어요."),
        makeCut(46, 780, 994, 211, "순간, 세상은 아주 밝은 빛으로 가득 찼어요."),
        makeCut(46, 999, 994, 377, "비 내리는 길 위에는 파란 방울만이 조용히 남아 있었답니다.")
      ]
    },
    {
      img: prologueImgs[3],
      cuts: [
        makeCut(154, 87, 893, 219, "얼마나 시간이 흘렀을까요. 고양이는 낯선 구름 위에서 천천히 눈을 떴어요."),
        makeCut(39, 313, 1008, 306, "그곳은 차갑지도, 아프지도 않은 아주 조용한 하늘의 세계였어요."),
        makeCut(39, 627, 336, 314, "고양이는 깜짝 놀라 주위를 둘러보았어요."),
        makeCut(382, 627, 316, 314, "익숙한 방도, 주인의 목소리도 보이지 않았어요."),
        makeCut(704, 627, 343, 314, "그때, 고양이 앞에 파란 방울이 다시 나타났어요."),
        makeCut(39, 949, 1008, 460, "하늘 너머에서 다정한 목소리가 들려왔어요. “주인을 다시 만나고 싶니?”")
      ]
    },
    {
      img: prologueImgs[4],
      cuts: [
        makeCut(47, 139, 992, 310, "고양이는 입에 물고 있던 파란 방울을 조심스럽게 내려놓았어요."),
        makeCut(47, 457, 992, 324, "빛 속의 존재는 말했어요. “너의 마음이 진심이라면, 흩어진 기억의 조각을 모으렴.”"),
        makeCut(46, 789, 994, 285, "그러자 방울은 따뜻한 빛을 내며 고양이의 목을 부드럽게 감싸기 시작했어요."),
        makeCut(46, 1084, 993, 305, "“이 방울이 너를 이끌어 줄 거야.” 방울은 작은 목걸이가 되어 고양이의 가슴에 자리 잡았답니다.")
      ]
    },
    {
      img: prologueImgs[5],
      cuts: [
        makeCut(0, 0, 1086, 1448, "고양이 앞에는 끝없이 이어진 구름길과 하늘의 섬들이 펼쳐져 있었어요. 이제, 기억을 찾는 여행이 시작됩니다.")
      ]
    }
  ];
}

function makeMiddleData() {
  middleData = [
    {
      img: middleImgs[0],
      cuts: [
        makeCut(40, 55, 1018, 347, "천국의 길 위에서 고양이는 첫 번째 기억의 조각을 발견했어요."),
        makeCut(38, 403, 333, 309, "그 조각 속에는, 작고 겁 많던 시절의 자신이 숨어 있었답니다."),
        makeCut(377, 403, 320, 309, "그때 한 사람이 조용히 다가와, 고양이 앞에 작은 방울을 놓아 주었어요."),
        makeCut(702, 403, 356, 309, "고양이는 처음엔 무서워서 가까이 가지 못했지만, 방울 소리에 조금씩 마음을 열었어요."),
        makeCut(38, 711, 502, 293, "고양이는 천천히 몸을 낮추고, 처음으로 방울을 향해 앞발을 뻗었어요."),
        makeCut(540, 711, 518, 293, "그 순간 기억의 조각 속에서, 잊고 있던 주인의 얼굴이 희미하게 떠올랐답니다."),
        makeCut(40, 1005, 1017, 433, "고양이는 깨달았어요. 자신이 돌아가고 싶은 곳은, 바로 그 사람의 곁이라는 것을요.")
      ]
    },
    {
      img: middleImgs[1],
      cuts: [
        makeCut(87, 54, 913, 429, "다음 기억은 하늘 저편의 문을 향한 길 위에서 고양이를 기다리고 있었어요."),
        makeCut(87, 487, 913, 315, "고양이가 조각에 앞발을 대자, 비 내리던 창가의 기억이 조용히 펼쳐졌어요."),
        makeCut(86, 808, 915, 284, "주인과 고양이는 말없이 창밖의 비를 바라보곤 했어요."),
        makeCut(86, 1098, 483, 309, "지친 밤이면, 고양이는 주인 곁에 가만히 앉아 있어 주었어요."),
        makeCut(573, 1098, 428, 309, "그리고 주인은 그런 고양이를 바라보며 아주 조금씩 다시 웃을 수 있었답니다.")
      ]
    },
    {
      img: middleImgs[2],
      cuts: [
        makeCut(59, 92, 976, 372, "고양이는 또 다른 기억의 조각을 향해 걸어갔어요."),
        makeCut(59, 471, 977, 391, "그 기억 속에서 주인과 고양이는 조용한 밤을 함께 보내고 있었어요."),
        makeCut(59, 868, 493, 533, "주인이 힘들어하던 날에도, 고양이는 말없이 곁을 지켜 주었지요."),
        makeCut(558, 867, 478, 535, "기억을 되찾을수록 고양이의 몸은 조금씩 더 또렷해지고, 마음도 선명해졌어요.")
      ]
    },
    {
      img: middleImgs[3],
      cuts: [
        makeCut(98, 45, 443, 334, "마지막 기억은, 그날의 아침으로 고양이를 데려갔어요."),
        makeCut(544, 45, 445, 334, "열려 있던 창문과 바람에 흔들리던 커튼이 보였어요."),
        makeCut(98, 383, 443, 274, "파란 방울은 창밖으로 떨어졌고,"),
        makeCut(543, 384, 446, 273, "고양이는 그 방울을 되찾기 위해 밖으로 달려갔어요."),
        makeCut(99, 661, 890, 388, "흩어진 기억들이 모두 모이자, 고양이는 자신이 왜 돌아가고 싶었는지 완전히 떠올렸어요."),
        makeCut(99, 1052, 890, 362, "하늘의 문이 열리고, 고양이는 주인을 만나기 위해 지상으로 뛰어내렸답니다.")
      ]
    }
  ];
}

function makeTrueEndingData() {
  trueEndingData = [
    {
      img: trueEndingImgs[0],
      cuts: [
        makeCut(145, 47, 798, 392, "고양이는 기억 속 길을 따라, 마침내 익숙한 집 앞에 도착했어요."),
        makeCut(144, 445, 800, 345, "열려 있던 창문을 지나, 고양이는 조심스럽게 방 안으로 들어갔어요."),
        makeCut(143, 794, 801, 335, "방 안에는 주인이 잠들어 있었고, 모든 것이 오래전 기억처럼 조용했어요."),
        makeCut(143, 1134, 801, 285, "고양이는 천천히 침대 위로 올라가, 주인의 곁으로 다가갔답니다.")
      ]
    },
    {
      img: trueEndingImgs[1],
      cuts: [
        makeCut(143, 28, 792, 471, "고양이는 잠든 주인을 바라보았어요. 보고 싶었던 얼굴이 바로 눈앞에 있었지요."),
        makeCut(142, 504, 793, 296, "고양이는 조용히 주인에게 다가가, 자신의 이마를 주인의 이마에 살며시 맞댔어요."),
        makeCut(141, 805, 794, 296, "그 순간, 두 사람은 같은 꿈속으로 들어갔어요."),
        makeCut(140, 1105, 794, 321, "꿈속에서 주인은 고양이를 꼭 끌어안고, 오래 참아 온 눈물을 흘렸답니다.")
      ]
    },
    {
      img: trueEndingImgs[2],
      cuts: [
        makeCut(151, 51, 793, 362, "꿈속의 방 안에서 주인은 고양이를 바라보며 떨리는 목소리로 말했어요."),
        makeCut(151, 423, 793, 335, "“미안해. 그날 창문만 닫고 갔어도...”"),
        makeCut(151, 768, 793, 283, "고양이는 아무 말 없이 주인의 손에 얼굴을 비볐어요."),
        makeCut(151, 1062, 793, 346, "그 마음은 분명했어요. 고양이는 단 한 번도 주인을 원망하지 않았답니다.")
      ]
    },
    {
      img: trueEndingImgs[3],
      cuts: [
        makeCut(98, 43, 894, 429, "아침이 되었을 때, 주인은 천천히 눈을 떴어요."),
        makeCut(97, 475, 895, 474, "베개 옆에는 꿈속에서 본 것과 같은 파란 방울이 조용히 놓여 있었지요."),
        makeCut(98, 951, 423, 465, "주인은 방울을 두 손으로 감싸 쥐고, 한참 동안 바라보았어요."),
        makeCut(522, 951, 470, 465, "그리고 아주 오랜만에, 작게 웃을 수 있었답니다.")
      ]
    }
  ];
}

function startPrologue() {
  storyData = prologueData;
  nextScreenAfterStory = "heavenReady";
  startStoryScreen();
}

function startMiddleStory() {
  storyData = middleData;
  nextScreenAfterStory = "earthReady";
  startStoryScreen();
}

function startTrueEndingStory() {
  storyData = trueEndingData;
  nextScreenAfterStory = "ending4";
  startStoryScreen();
}

function startStoryScreen() {
  currentScreen = "story";
  currentPage = 0;
  currentCut = 0;
  cutStartFrame = frameCount;
  instantText = false;
  storyAutoMode = defaultAutoStory;
}

function drawStoryScreen() {
  background(12, 12, 18);

  let page = storyData[currentPage];

  drawStoryPageFrame();
  drawStoryCuts(page);
  drawStoryTextBox(page.cuts[currentCut].text);
  drawStoryProgress();
  drawStoryControlButtons();
}

function getPageLayout() {
  let pageAreaW = gameW - 110;
  let pageAreaH = gameH - 310;

  let s = min(pageAreaW / gameW, pageAreaH / gameH);
  let w = gameW * s;
  let h = gameH * s;
  let x = (gameW - w) / 2;
  let y = 46;

  return { x, y, w, h, s };
}

function drawStoryPageFrame() {
  let p = getPageLayout();

  noStroke();
  fill(236, 226, 210);
  rect(p.x + p.w / 2, p.y + p.h / 2, p.w + 26, p.h + 26, 18);

  fill(247, 239, 224);
  rect(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 12);
}

function drawStoryCuts(page) {
  let p = getPageLayout();

  for (let i = 0; i < page.cuts.length; i++) {
    drawBlankCut(page.cuts[i], p);
  }

  for (let i = 0; i <= currentCut; i++) {
    let cut = page.cuts[i];
    let alpha = 1;

    if (i === currentCut) {
      let t = constrain((frameCount - cutStartFrame) / 30, 0, 1);
      alpha = 1 - pow(1 - t, 3);
    }

    drawRevealedCut(page.img, cut, p, alpha, i === currentCut);
  }
}

function drawBlankCut(cut, p) {
  let dx = p.x + cut.x * p.s;
  let dy = p.y + cut.y * p.s;
  let dw = cut.w * p.s;
  let dh = cut.h * p.s;

  noStroke();
  fill(235, 226, 211);
  rect(dx + dw / 2, dy + dh / 2, dw, dh, 5);

  stroke(165, 145, 120, 150);
  strokeWeight(2);
  noFill();
  rect(dx + dw / 2, dy + dh / 2, dw, dh, 5);
}

function drawRevealedCut(img, cut, p, alpha, isCurrent) {
  let dx = p.x + cut.x * p.s;
  let dy = p.y + cut.y * p.s;
  let dw = cut.w * p.s;
  let dh = cut.h * p.s;

  if (!img || img.width === 0 || img.height === 0) {
    fill(90, 70, 70);
    noStroke();
    rect(dx + dw / 2, dy + dh / 2, dw, dh, 5);

    fill(255, 230, 220);
    textFont("serif");
    textSize(22);
    text("이미지 로딩 실패", dx + dw / 2, dy + dh / 2);
    return;
  }

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(dx, dy, dw, dh);
  drawingContext.clip();

  tint(255, 255 * alpha);
  image(img, p.x, p.y, p.w, p.h, 0, 0, gameW, gameH);
  noTint();

  drawingContext.restore();

  if (isCurrent) {
    stroke(255, 245, 220, 220 * alpha);
    strokeWeight(4);
    noFill();
    rect(dx + dw / 2, dy + dh / 2, dw + 8, dh + 8, 8);
  }
}

function drawStoryTextBox(txt) {
  let boxW = gameW - 110;
  let boxH = 185;
  let boxX = gameW / 2;
  let boxY = gameH - 116;

  noStroke();
  fill(5, 5, 12, highContrastText ? 245 : 205);
  rect(boxX, boxY, boxW, boxH, 28);

  let shownText = getTypingText(txt);

  fill(255, 248, 230);
  textFont("serif");
  textSize(30 * storyTextScale);

  drawCenteredParagraph(shownText, boxX, boxY - 58, boxW - 135, 42 * storyTextScale);

  fill(255, 243, 225, highContrastText ? 230 : 145);
  textSize(21 * storyTextScale);

  if (isTextFinished(txt)) {
    text("클릭 또는 SPACE로 다음", boxX - 20, boxY + 58);
  } else {
    text("...", boxX - 20, boxY + 58);
  }
}

function drawCenteredParagraph(str, centerX, startY, maxWidth, lineHeight) {
  textAlign(CENTER, TOP);

  let lines = [];
  let currentLine = "";

  for (let i = 0; i < str.length; i++) {
    let testLine = currentLine + str[i];

    if (textWidth(testLine) > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = str[i];
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  for (let i = 0; i < lines.length; i++) {
    text(lines[i], centerX, startY + i * lineHeight);
  }

  textAlign(CENTER, CENTER);
}

function getTypingText(txt) {
  if (instantText) return txt;

  let passed = frameCount - cutStartFrame - 10;
  let count = constrain(floor(passed * TEXT_SPEED), 0, txt.length);

  return txt.substring(0, count);
}

function isTextFinished(txt) {
  if (instantText) return true;

  let passed = frameCount - cutStartFrame - 10;
  let count = constrain(floor(passed * TEXT_SPEED), 0, txt.length);

  return count >= txt.length;
}

function drawStoryProgress() {
  let totalPage = storyData.length;
  let totalCut = storyData[currentPage].cuts.length;

  fill(255, 243, 225, 170);
  noStroke();
  textFont("serif");
  textSize(21);

  text(
    "페이지 " + (currentPage + 1) + " / " + totalPage +
    "   ·   컷 " + (currentCut + 1) + " / " + totalCut,
    gameW / 2,
    24
  );
}


function showReadyScreen(screenName) {
  currentScreen = screenName;
  readyScreenEnterFrame = frameCount;
  storyAutoMode = defaultAutoStory;
}

function drawStoryControlButtons() {
  textFont('serif');

  for (let b of storyControlButtons) {
    let hover = isMouseOnRect(b.x, b.y, b.w, b.h);

    if (hover) {
      fill(255, 244, 223, 238);
      stroke(95, 75, 110);
      strokeWeight(2.5);
    } else {
      fill(255, 244, 223, 175);
      stroke(255, 240, 225, 150);
      strokeWeight(2);
    }

    rect(b.x, b.y, b.w, b.h, 14);

    noStroke();
    fill(70, 55, 85);
    textSize(20);

    if (b.name === 'auto' && storyAutoMode) {
      text('자동ON', b.x, b.y + 1);
    } else {
      text(b.label, b.x, b.y + 1);
    }
  }
}


function goStoryBackOneCut() {
  storyAutoMode = false;
  instantText = false;

  if (currentScreen !== 'story') {
    return;
  }

  if (currentCut > 0) {
    currentCut--;
    cutStartFrame = frameCount;
    return;
  }

  if (currentPage > 0) {
    currentPage--;
    currentCut = storyData[currentPage].cuts.length - 1;
    cutStartFrame = frameCount;
    return;
  }

  // 첫 컷에서만 타이틀로 돌아감
  currentScreen = 'title';
}

function updateStoryAutoPlay() {
  if (!storyAutoMode || currentScreen !== 'story') return;

  let txt = storyData[currentPage].cuts[currentCut].text;

  if (!isTextFinished(txt)) {
    instantText = true;
    return;
  }

  if (frameCount - cutStartFrame > 55) {
    advanceStory();
  }
}

function isMouseOnRect(cx, cy, w, h) {
  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);

  return mx > cx - w / 2 && mx < cx + w / 2 &&
         my > cy - h / 2 && my < cy + h / 2;
}

function loadAlbumData() {
  if (albumDataLoaded) return;

  albumDataLoaded = true;

  try {
    let raw = localStorage.getItem('cat_descent_album');
    if (raw) {
      let parsed = JSON.parse(raw);
      unlockedEndings = Object.assign(unlockedEndings, parsed);
    }

    let settingsRaw = localStorage.getItem('cat_descent_settings');
    if (settingsRaw) {
      let settings = JSON.parse(settingsRaw);
      if (settings.storyTextScale) storyTextScale = settings.storyTextScale;
      if (settings.defaultAutoStory !== undefined) defaultAutoStory = settings.defaultAutoStory;
      if (settings.highContrastText !== undefined) highContrastText = settings.highContrastText;
      if (settings.bgmVolume !== undefined && typeof setBgmVolume === 'function') setBgmVolume(settings.bgmVolume);
    }
  } catch (e) {
    console.log('album/settings load fail');
  }
}


function saveSettingsData() {
  try {
    localStorage.setItem('cat_descent_settings', JSON.stringify({
      storyTextScale: storyTextScale,
      defaultAutoStory: defaultAutoStory,
      highContrastText: highContrastText,
      bgmVolume: (typeof bgmVolume === 'number' ? bgmVolume : 0.42)
    }));
  } catch (e) {
    console.log('settings save fail');
  }
}




function drawSettingsScreen() {
  drawCoverImage(titleImg, 0, 0, gameW, gameH);

  noStroke();
  fill(0, 165);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  textFont('serif');
  fill(255, 245, 230);
  textSize(56);
  text('설정', gameW / 2, 145);

  drawSettingPanel();
  drawSettingsBackButton();
}

function drawSettingPanel() {
  let panelX = gameW / 2;
  let panelY = 600;
  let panelW = 790;
  let panelH = 820;

  fill(255, 247, 225, 178);
  stroke(255, 245, 220, 190);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 28);

  noStroke();
  fill(65, 52, 80);
  textSize(31);
  text('글씨 크기', panelX, panelY - 320);

  fill(65, 52, 80, 188);
  textSize(19);
  text('스토리 대사와 게임 방법 글씨 크기를 조절해.', panelX, panelY - 286);

  drawSettingChoice('보통', panelX - 220, panelY - 230, 150, 54, abs(storyTextScale - 1.0) < 0.01);
  drawSettingChoice('크게', panelX, panelY - 230, 150, 54, abs(storyTextScale - 1.22) < 0.01);
  drawSettingChoice('아주 크게', panelX + 220, panelY - 230, 180, 54, abs(storyTextScale - 1.42) < 0.01);

  fill(65, 52, 80);
  textSize(31);
  text('고대비 자막', panelX, panelY - 120);

  fill(65, 52, 80, 188);
  textSize(19);
  text('대사창을 더 진하게 만들어 글씨가 잘 보이게 해.', panelX, panelY - 86);

  drawSettingChoice('꺼짐', panelX - 95, panelY - 30, 150, 54, !highContrastText);
  drawSettingChoice('켜짐', panelX + 95, panelY - 30, 150, 54, highContrastText);

  fill(65, 52, 80);
  textSize(31);
  text('스토리 자동 넘김', panelX, panelY + 80);

  fill(65, 52, 80, 188);
  textSize(19);
  text('새 스토리를 시작할 때 자동 넘김을 기본으로 켤지 정해.', panelX, panelY + 114);

  drawSettingChoice('꺼짐', panelX - 95, panelY + 170, 150, 54, !defaultAutoStory);
  drawSettingChoice('켜짐', panelX + 95, panelY + 170, 150, 54, defaultAutoStory);

  drawMainVolumeSetting(panelX, panelY + 302);
}

function drawMainVolumeSetting(x, y) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  noStroke();
  fill(65, 52, 80);
  textSize(31);
  text('음악 소리', x, y - 70);

  fill(65, 52, 80, 188);
  textSize(19);
  text('배경음악 크기를 조절해.', x, y - 36);

  fill(255, 245, 225, 155);
  stroke(255, 245, 220, 160);
  strokeWeight(2);
  rect(x, y + 24, 360, 64, 18);

  let percent = typeof getBgmVolumePercent === 'function' ? getBgmVolumePercent() : 42;

  noStroke();
  fill(70, 55, 85);
  textSize(24);
  text(percent + '%', x, y + 25);

  drawSettingChoice('-', x - 130, y + 24, 62, 48, false);
  drawSettingChoice('+', x + 130, y + 24, 62, 48, false);

  pop();
}

function drawSettingChoice(label, x, y, w, h, selected) {
  let hover = isMouseOnRect(x, y, w, h);

  if (selected) {
    fill(80, 63, 96, 235);
    stroke(255, 245, 220, 235);
  } else if (hover) {
    fill(255, 245, 225, 240);
    stroke(80, 63, 96, 220);
  } else {
    fill(255, 245, 225, 155);
    stroke(255, 245, 220, 160);
  }

  strokeWeight(2);
  rect(x, y, w, h, 18);

  noStroke();
  fill(selected ? color(255, 245, 230) : color(70, 55, 85));
  textSize(24);
  text(label, x, y + 1);
}

function drawSettingsBackButton() {
  fill(255, 245, 220, 145);
  stroke(255, 245, 220);
  strokeWeight(2);
  rect(gameW / 2, 1280, 330, 68, 18);

  noStroke();
  fill(70, 55, 85);
  textSize(31);
  text('돌아가기', gameW / 2, 1282);
}

function handleSettingsClick() {
  let panelY = 600;

  if (isMouseOnRect(gameW / 2 - 220, panelY - 230, 150, 54)) {
    storyTextScale = 1.0;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2, panelY - 230, 150, 54)) {
    storyTextScale = 1.22;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 + 220, panelY - 230, 180, 54)) {
    storyTextScale = 1.42;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 - 95, panelY - 30, 150, 54)) {
    highContrastText = false;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 + 95, panelY - 30, 150, 54)) {
    highContrastText = true;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 - 95, panelY + 170, 150, 54)) {
    defaultAutoStory = false;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 + 95, panelY + 170, 150, 54)) {
    defaultAutoStory = true;
    saveSettingsData();
    return;
  }

  if (isMouseOnRect(gameW / 2 - 130, panelY + 326, 62, 48)) {
    if (typeof setBgmVolume === 'function') {
      setBgmVolume((typeof bgmVolume === 'number' ? bgmVolume : 0.42) - 0.1);
    }
    return;
  }

  if (isMouseOnRect(gameW / 2 + 130, panelY + 326, 62, 48)) {
    if (typeof setBgmVolume === 'function') {
      setBgmVolume((typeof bgmVolume === 'number' ? bgmVolume : 0.42) + 0.1);
    }
    return;
  }

  if (isMouseOnRect(gameW / 2, 1280, 330, 68)) {
    currentScreen = 'title';
  }
}


function saveAlbumData() {
  try {
    localStorage.setItem('cat_descent_album', JSON.stringify(unlockedEndings));
  } catch (e) {
    console.log('album save fail');
  }
}

function unlockEnding(id) {
  loadAlbumData();

  if (!unlockedEndings[id]) {
    unlockedEndings[id] = true;
    saveAlbumData();
  }
}

function drawAlbumScreen() {
  loadAlbumData();

  drawCoverImage(titleImg, 0, 0, gameW, gameH);

  noStroke();
  fill(0, 150);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  textFont('serif');
  fill(255, 245, 230);
  textSize(54);
  text('기억 앨범', gameW / 2, 325);

  fill(255, 245, 230, 165);
  textSize(23);
  text('해금된 엔딩 삽화를 클릭하면 크게 볼 수 있어.', gameW / 2, 382);

  let entries = getAlbumEntries();
  let layout = getAlbumLayout();

  for (let i = 0; i < entries.length; i++) {
    let col = i % 2;
    let row = floor(i / 2);
    let x = layout.startX + col * (layout.cardW + layout.gapX);
    let y = layout.startY + row * (layout.cardH + layout.gapY);

    drawAlbumCard(entries[i], x, y, layout.cardW, layout.cardH);
  }

  drawAlbumBackButton();

  if (albumSelectedEnding) {
    drawAlbumModal(albumSelectedEnding);
  }
}

function getAlbumEntries() {
  return [
    { id:'ending1', title:'엔딩 1 · 다시 만나지 못한 약속', img: typeof ending1Img !== 'undefined' ? ending1Img : null },
    { id:'ending2', title:'엔딩 2 · 천국으로 돌아가다', img: typeof ending2Img !== 'undefined' ? ending2Img : null },
    { id:'ending3', title:'엔딩 3 · 떠돌이 영혼', img: typeof ending3Img !== 'undefined' ? ending3Img : null },
    { id:'ending4', title:'엔딩 4 · 다녀왔어', img: ending4Img }
  ];
}

function getAlbumLayout() {
  let cardW = 345;
  let cardH = 290;
  let gapX = 54;
  let gapY = 64;
  let totalW = cardW * 2 + gapX;
  let startX = gameW / 2 - totalW / 2 + cardW / 2;
  let startY = 585;

  return { cardW, cardH, gapX, gapY, startX, startY };
}

function drawAlbumCard(e, x, y, cardW, cardH) {
  let unlocked = !!unlockedEndings[e.id];
  let hover = isMouseOnRect(x, y, cardW, cardH);

  fill(250, 241, 228, hover ? 245 : 220);
  stroke(255, 245, 225, hover ? 230 : 120);
  strokeWeight(hover ? 3 : 2);
  rect(x, y, cardW, cardH, 24);

  if (unlocked && e.img && e.img.width > 0) {
    drawCoverImage(e.img, x - cardW / 2 + 22, y - cardH / 2 + 25, cardW - 44, 205);

    fill(70, 55, 85);
    textSize(23);
    text(e.title, x, y + 110);

    fill(70, 55, 85, 145);
    textSize(18);
    text('클릭해서 크게 보기', x, y + 145);
  } else {
    fill(80, 82, 96, 225);
    rect(x, y - 34, cardW - 44, 205, 18);

    fill(255, 245, 230, 180);
    textSize(56);
    text('LOCK', x, y - 36);

    fill(70, 55, 85);
    textSize(23);
    text('아직 열리지 않은 엔딩', x, y + 110);

    fill(70, 55, 85, 135);
    textSize(18);
    text('엔딩을 보면 이곳에 저장돼.', x, y + 145);
  }
}

function drawAlbumBackButton() {
  fill(255, 245, 220, 145);
  stroke(255, 245, 220);
  strokeWeight(2);
  rect(gameW / 2, 1365, 330, 62, 18);

  noStroke();
  fill(70, 55, 85);
  textSize(30);
  text('돌아가기', gameW / 2, 1367);
}

function drawAlbumModal(e) {
  noStroke();
  fill(0, 0, 0, 190);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  let modalW = 820;
  let modalH = 1030;

  fill(246, 238, 224, 245);
  stroke(255, 250, 230, 210);
  strokeWeight(3);
  rect(gameW / 2, gameH / 2, modalW, modalH, 30);

  if (e.img && e.img.width > 0) {
    drawCoverImage(e.img, gameW / 2 - 345, 245, 690, 800);
  } else {
    fill(45, 48, 70);
    rect(gameW / 2, 645, 690, 800, 20);
  }

  noStroke();
  fill(55, 45, 70);
  textSize(34);
  text(e.title, gameW / 2, 1110);

  fill(70, 55, 85, 170);
  textSize(22);
  text('클릭 또는 ESC로 닫기', gameW / 2, 1170);
}


function advanceStory() {
  let cut = storyData[currentPage].cuts[currentCut];

  if (!isTextFinished(cut.text)) {
    instantText = true;
    return;
  }

  instantText = false;

  if (currentCut < storyData[currentPage].cuts.length - 1) {
    currentCut++;
    cutStartFrame = frameCount;
    return;
  }

  if (currentPage < storyData.length - 1) {
    currentPage++;
    currentCut = 0;
    cutStartFrame = frameCount;
    return;
  }

  cutStartFrame = frameCount;
  showReadyScreen(nextScreenAfterStory);
}

function drawHeavenReadyScreen() {
  drawCoverImage(titleImg, 0, 0, gameW, gameH);

  noStroke();
  fill(0, 110);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  textFont("serif");
  textAlign(CENTER, CENTER);

  fill(255, 246, 230);
  textSize(58);
  text("천국 스테이지", gameW / 2, gameH / 2 - 70);

  fill(255, 246, 230, 185);
  textSize(24);
  text("게임이 시작되면 화면 안에 설명서가 표시됩니다.", gameW / 2, gameH / 2 + 5);

  let left = max(1, ceil((105 - (frameCount - readyScreenEnterFrame)) / 60));
  fill(255, 246, 230, 210);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textSize(20);
  text(left + "초 후 시작", gameW / 2, gameH / 2 + 80);
}

function drawHeavenManualPanel() {
  let panelX = gameW / 2;
  let panelY = 705;
  let panelW = 820;
  let panelH = 860;

  noStroke();
  fill(255, 250, 232, 232);
  rect(panelX, panelY, panelW, panelH, 34);

  stroke(255, 255, 255, 150);
  strokeWeight(2);
  noFill();
  rect(panelX, panelY, panelW - 16, panelH - 16, 30);

  drawManualCard(315, 520, 315, 300, "먹어야 하는 것", "memory", [
    "기억조각 / 별조각",
    "18개를 모으면 천국문 조건 달성"
  ]);

  drawManualCard(705, 520, 315, 300, "피해야 하는 것", "danger", [
    "먹구름: 위로 튕김",
    "깃털: 하트 -1",
    "검은비: 하트 -1 + 느려짐",
    "그림자: 하트 -1 + 밀림"
  ]);

  drawManualWideCard(510, 920, 645, 270, "클리어 방법", [
    "① 기억조각 18개 모으기",
    "② 발판을 밟으며 아래로 내려가기",
    "③ 기억이 충분할 때 지상문 통과하기"
  ], [
    "기억조각이 부족한 상태로 지상문에 닿으면 다른 엔딩으로 이어집니다.",
    "먹구름은 막힌 벽이 아니라 고양이를 위로 튕겨 올리는 방해 발판입니다."
  ]);

  drawManualControlHint(510, 1165);
}

function drawManualCard(x, y, w, h, title, type, lines) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Noto Sans KR, Pretendard, sans-serif");

  fill(255, 255, 252, 246);
  stroke(120, 106, 136, 55);
  strokeWeight(2);
  rect(x, y, w, h, 24);

  noStroke();
  fill(78, 64, 92);
  textSize(26);
  text(title, x, y - 105);

  if (type === "memory") {
    drawManualMemoryIcon(x, y - 40);
  } else {
    drawManualDangerIcons(x, y - 42);
  }

  fill(82, 70, 96);
  textSize(18);
  textLeading(30);
  text(lines.join("\n"), x, y + 70);

  pop();
}

function drawManualWideCard(x, y, w, h, title, mainLines, subLines) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Noto Sans KR, Pretendard, sans-serif");

  fill(255, 255, 252, 242);
  stroke(120, 106, 136, 55);
  strokeWeight(2);
  rect(x, y, w, h, 24);

  noStroke();
  fill(78, 64, 92);
  textSize(27);
  text(title, x, y - 88);

  fill(76, 64, 92);
  textSize(19);
  text(mainLines.join("     "), x, y - 20);

  fill(112, 100, 122, 215);
  textSize(15);
  textLeading(27);
  text(subLines.join("\n"), x, y + 58);

  pop();
}

function drawManualControlHint(x, y) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Noto Sans KR, Pretendard, sans-serif");

  fill(72, 60, 90, 225);
  noStroke();
  rect(x, y, 650, 74, 22);

  fill(255, 246, 230, 235);
  textSize(16);
  text("조작: 마우스 포인터 따라가기  ·  A/D 또는 ←/→ 이동  ·  발판 착지 시 자동 점프", x, y);

  pop();
}

function drawManualMemoryIcon(x, y) {
  push();
  translate(x, y);
  noStroke();
  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = color(255, 220, 80, 210);
  fill(255, 224, 58);
  beginShape();
  vertex(0, -36);
  vertex(10, -10);
  vertex(36, 0);
  vertex(10, 10);
  vertex(0, 36);
  vertex(-10, 10);
  vertex(-36, 0);
  vertex(-10, -10);
  endShape(CLOSE);
  fill(90, 205, 235);
  ellipse(0, 0, 10, 10);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawManualDangerIcons(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill(18, 20, 30);
  ellipse(-66, 8, 34, 22);
  ellipse(-46, 0, 31, 31);
  ellipse(-25, 9, 28, 19);
  fill(60, 68, 88, 190);
  ellipse(-47, -8, 12, 5);

  stroke(18, 20, 30);
  strokeWeight(6);
  line(16, -34, 16, 22);
  line(16, 22, 36, 22);
  noStroke();

  stroke(20, 22, 30);
  strokeWeight(4);
  line(74, -18, 112, 18);
  line(112, -18, 74, 18);

  pop();
}

function drawEarthReadyScreen() {
  drawCoverImage(titleImg, 0, 0, gameW, gameH);

  noStroke();
  fill(0, 115);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  textFont("serif");
  textAlign(CENTER, CENTER);

  fill(255, 246, 230);
  textSize(58);
  text("지상 스테이지", gameW / 2, gameH / 2 - 70);

  fill(255, 246, 230, 185);
  textSize(24);
  text("게임이 시작되면 화면 안에 설명서가 표시됩니다.", gameW / 2, gameH / 2 + 5);

  let left = max(1, ceil((105 - (frameCount - readyScreenEnterFrame)) / 60));
  fill(255, 246, 230, 210);
  textFont("Noto Sans KR, Pretendard, sans-serif");
  textSize(20);
  text(left + "초 후 시작", gameW / 2, gameH / 2 + 80);
}

function drawEarthManualPanel() {
  let panelX = gameW / 2;
  let panelY = 725;
  let panelW = 820;
  let panelH = 800;

  noStroke();
  fill(255, 250, 232, 232);
  rect(panelX, panelY, panelW, panelH, 34);

  stroke(255, 255, 255, 150);
  strokeWeight(2);
  noFill();
  rect(panelX, panelY, panelW - 16, panelH - 16, 30);

  drawManualCard(315, 550, 315, 300, "밟고 내려갈 것", "memory", [
    "구름 / 비둘기 / 작은 새",
    "건물 구간부터 간판 발판 등장"
  ]);

  drawManualCard(705, 550, 315, 300, "피해야 하는 것", "danger", [
    "캔: 하트 -1 + 느려짐",
    "병: 하트 -2",
    "전선: 하트 -1 + 밀림",
    "비닐봉지: 하트 -1 + 위로 튕김"
  ]);

  drawManualWideCard(510, 950, 645, 245, "클리어 방법", [
    "① 양옆 발판 이용",
    "② 장애물 피하기",
    "③ 지상까지 내려가기"
  ], [
    "비행기는 초반에만 나오며, 밟으면 위로 튕겨 시간이 늦어집니다.",
    "건물 배경이 보이면 새와 간판 발판을 중심으로 내려가면 됩니다."
  ]);

  drawManualControlHint(510, 1175);
}


function drawEnding4Screen() {
  unlockEnding('ending4');
  let fade = constrain(map(frameCount - cutStartFrame, 0, 110, 0, 255), 0, 255);
  let textFade = constrain(map(frameCount - cutStartFrame, 70, 155, 0, 255), 0, 255);

  background(0);
  if (ending4Img && ending4Img.width > 0) {
    tint(255, fade);
    drawCoverImage(ending4Img, 0, 0, gameW, gameH);
    noTint();
  } else {
    noStroke();
    fill(18, 22, 38, fade);
    rect(gameW / 2, gameH / 2, gameW, gameH);
    fill(70, 170, 255, fade);
    ellipse(gameW / 2, gameH / 2, 80, 80);
    fill(255, 246, 230, fade);
    textFont('serif');
    textSize(38);
    text('딸랑', gameW / 2, gameH / 2 + 95);
  }

  noStroke();
  fill(0, 0, 0, 80 * (fade / 255));
  rect(gameW / 2, gameH / 2, gameW, gameH);

  fill(0, 0, 0, 125 * (textFade / 255));
  rect(gameW / 2, gameH - 170, gameW - 120, 210, 32);

  fill(255, 246, 230, textFade);
  textFont('serif');
  textSize(48);
  text('엔딩 4  ·  다녀왔어', gameW / 2, gameH - 235);

  textSize(28);
  fill(255, 246, 230, textFade * 0.9);
  text('꿈에서 다시 만난 고양이는 방울을 남기고 사라졌다.', gameW / 2, gameH - 178);

  textSize(24);
  fill(255, 246, 230, textFade * 0.75);
  text('함께한 시간은 사라지지 않는다.  언젠가 다시 만나자.', gameW / 2, gameH - 124);
}


function mousePressedStory() {
  if (currentScreen === "title") {
    for (let b of buttons) {
      if (isMouseOnButton(b)) {
        if (b.name === "start") {
          startPrologue();
        } else if (b.name === "how") {
          currentScreen = "how";
          howPage = 0;
        } else if (b.name === "album") {
          currentScreen = "album";
        } else if (b.name === "option") {
          currentScreen = "settings";
        }
      }
    }
  } else if (currentScreen === "settings") {
    handleSettingsClick();
  } else if (currentScreen === "album") {
    if (albumSelectedEnding) {
      albumSelectedEnding = null;
      return;
    }

    let mx = screenToGameX(mouseX);
    let my = screenToGameY(mouseY);

    let layout = getAlbumLayout();
    let entries = getAlbumEntries();

    for (let i = 0; i < entries.length; i++) {
      let col = i % 2;
      let row = floor(i / 2);
      let x = layout.startX + col * (layout.cardW + layout.gapX);
      let y = layout.startY + row * (layout.cardH + layout.gapY);
      let e = entries[i];

      if (mx > x - layout.cardW / 2 && mx < x + layout.cardW / 2 &&
          my > y - layout.cardH / 2 && my < y + layout.cardH / 2) {
        if (unlockedEndings[e.id]) {
          albumSelectedEnding = e;
        }
        return;
      }
    }

    if (mx > gameW / 2 - 165 && mx < gameW / 2 + 165 &&
        my > 1365 - 31 && my < 1365 + 31) {
      currentScreen = "title";
    }
  } else if (currentScreen === "how") {
    handleHowClick();
  } else if (currentScreen === "story") {
    for (let b of storyControlButtons) {
      if (isMouseOnRect(b.x, b.y, b.w, b.h)) {
        if (b.name === "back") {
          goStoryBackOneCut();
        } else if (b.name === "skip") {
          showReadyScreen(nextScreenAfterStory);
        } else if (b.name === "auto") {
          storyAutoMode = !storyAutoMode;
        }
        return;
      }
    }

    advanceStory();
  }
}

function keyPressedStory() {
  if ((currentScreen === "heavenReady" || currentScreen === "earthReady") && keyCode === ENTER) {
    readyScreenEnterFrame = -9999;
    return;
  }

  if (currentScreen === "title" && keyCode === ENTER) {
    startPrologue();
  }

  if (currentScreen === "settings" && keyCode === ESCAPE) {
    currentScreen = "title";
  }

  if (currentScreen === "album" && keyCode === ESCAPE) {
    if (albumSelectedEnding) {
      albumSelectedEnding = null;
    } else {
      currentScreen = "title";
    }
  } else if (currentScreen === "how" && keyCode === ESCAPE) {
    currentScreen = "title";
  }

  if (currentScreen === "how" && keyCode === RIGHT_ARROW) {
    howPage = 1;
  }
  if (currentScreen === "how" && keyCode === LEFT_ARROW) {
    howPage = 0;
  }

  if (currentScreen === "story") {
    if (keyCode === 32 || keyCode === ENTER) {
      advanceStory();
    }

    if (key === "a" || key === "A") {
      storyAutoMode = !storyAutoMode;
    }

    if (key === "s" || key === "S") {
      showReadyScreen(nextScreenAfterStory);
    }

    if (key === "b" || key === "B" || keyCode === ESCAPE) {
      goStoryBackOneCut();
    }
  }

  if (currentScreen === "heavenReady") {
    if (key === "m" || key === "M") {
      startMiddleStory();
    }
  }

  if (currentScreen === "earthReady") {
    if (key === "t" || key === "T") {
      startTrueEndingStory();
    }
  }

  if (currentScreen === "ending4") {
    if (keyCode === ESCAPE) {
      currentScreen = "title";
    }
  }
}

function isMouseOnButton(b) {
  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);

  return (
    mx > b.x - b.w / 2 &&
    mx < b.x + b.w / 2 &&
    my > b.y - b.h / 2 &&
    my < b.y + b.h / 2
  );
}

function screenToGameX(x) {
  return (x - offsetX) / scaleRatio;
}

function screenToGameY(y) {
  return (y - offsetY) / scaleRatio;
}

function windowResizedStory() {
  resizeCanvas(windowWidth, windowHeight);
}
