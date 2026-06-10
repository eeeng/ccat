
let gameState = 'START'; // START, PLAYING, STORY, GAMEOVER, ENDING
let stage = 1;           // 1: 기억조각, 2: 지상으로

let player;
let platforms = [];
let memoryItems = [];
let obstacles = [];
let particles;

let cameraY = 0;
let lastSpawnY = 200;
let platformIndex = 0;
let missedMemorySpawnCount = 0;

let MEMORY_TARGET = 18;
let memoryCollected = 0;
let stageClearCountdown = -1;
let guideOverlayTimer = 0;
let stageIntroTimer = 0;

const STAGE1_GATE_Y = 6500;
const STAGE2_EARTH_Y = 6200;
let screenShake = 0;
let flashOverlayAlpha = 0;
let warningTimer = 0;
let connectionBreakTimer = 0;
let connectionBreakPower = 0;
let connectionBreakText = '';
let offscreenHighTimer = 0;
let blackCloudBounceCount = 0;
let blackCloudBounceTimer = 0;
let lastKeyboardControlFrame = -9999;
let lastMouseControlFrame = -9999;
let lastMouseGameX = null;
let lastMouseGameY = null;
let gamePauseMenuOpen = false;
let gameOverEnterFrame = 0;
let gameOverStage = 1;

let activeMemoryText = '';
let memoryTextTimer = 0;
let storyTimer = 0;

let endingStage = 0;
let endingTimer = 0;
let ownerX = 405;

let stars = [];
let highClouds = [];
let cityBackdrop = [];
let worldBuildings = [];
let mountains = [];

// 사진 적용 버전: 아래 두 파일만 Assets에 올리면 됩니다.
// - cat_sheet.png
// - owner_sheet.png
let catSheet = null;
let catSheetLoaded = false;
let ownerSheet = null;
let ownerSheetLoaded = false;

// 배경 참고 이미지 적용 버전
// - bg_stage1_ref.png    : 천국 스테이지 배경
// - bg_stage2_upper.png  : 지상 초반 하늘 배경
// - bg_stage2_mid.png    : 지상 중반 도시 간판 배경
// - bg_stage2_lower.png  : 지상 후반 골목/바닥 배경
let bgStage1 = null;
let bgStage1Loaded = false;
let bgStage2Upper = null;
let bgStage2UpperLoaded = false;
let bgStage2Mid = null;
let bgStage2MidLoaded = false;
let bgStage2Lower = null;
let bgStage2LowerLoaded = false;

const CAT_CELL_W = 300;
const CAT_CELL_H = 280;
const CAT_COLS = 4;
const OWNER_CELL_W = 330;
const OWNER_CELL_H = 400;
const OWNER_COLS = 3;

const CAT_FRAMES = {
  idle:   { i: 0, w: 160, h: 180 },
  sleepy: { i: 1, w: 156, h: 182 },
  walk1:  { i: 2, w: 166, h: 180 },
  walk2:  { i: 3, w: 166, h: 180 },
  walk3:  { i: 4, w: 166, h: 180 },
  jump:   { i: 5, w: 164, h: 184 },
  fall:   { i: 6, w: 156, h: 188 },
  hurt:   { i: 7, w: 160, h: 182 },
  happy:  { i: 8, w: 164, h: 182 },
  sad:    { i: 9, w: 158, h: 184 },
  spirit: { i:10, w: 170, h: 190 }
};

const OWNER_FRAMES = {
  stand:     { i: 0, w: 216, h: 370 },
  walk1:     { i: 1, w: 200, h: 365 },
  lookup:    { i: 2, w: 259, h: 365 },
  sad:       { i: 3, w: 202, h: 285 },
  cry:       { i: 4, w: 205, h: 282 },
  tearsmile: { i: 5, w: 186, h: 280 },
  reach:     { i: 6, w: 262, h: 285 },
  hug:       { i: 7, w: 284, h: 290 },
  lap:       { i: 8, w: 225, h: 312 }
};

const memoryTexts = [
  '따뜻한 손의 감촉이... 아주 조금 떠올라.',
  '밤마다 들리던 네 숨소리가 기억나.',
  '창가에 함께 앉아 햇빛을 나눴었지.',
  '내 이름을 부르던 목소리... 나비야.',
  '목이 마를까 봐 새 물을 챙겨주던 손.',
  '빨간 목걸이와 작은 방울 소리.',
  '마지막 날, 네가 잠깐 고개를 돌렸던 순간.',
  '미안해하지 마. 나는 네 곁에서 행복했어.',
  '울고 있는 너에게 꼭 한 번 더 가야 해.',
  '전부 기억났어. 이제 너를 만나러 갈게.'
];


const SIGN_TEXTS = ['치킨', '고시원', '문구', '24시', '세탁', '분식', '옥상', '슈퍼', '편의점', '카페', '고양이', '음악', '서점', '출구'];
const SIGN_STYLES = [
  { base: '#7a2d2d', border: '#f6d29f', text: '#fff0cf', accent: '#f9c36d' },
  { base: '#304d7a', border: '#d7ecff', text: '#eef7ff', accent: '#8dd2ff' },
  { base: '#37553e', border: '#def6d6', text: '#effbe7', accent: '#9ee19b' },
  { base: '#6f5c2c', border: '#fff0b8', text: '#fff6d8', accent: '#ffd66b' }
];
const NEON_STYLES = [
  { base: '#24344a', border: '#9ee8ff', text: '#dff9ff', accent: '#5be7ff' },
  { base: '#432f52', border: '#ffc7ec', text: '#fff0fb', accent: '#ff86cf' },
  { base: '#293a31', border: '#baffcf', text: '#eefff2', accent: '#83ffb0' }
];

// ==============================
// P5 STANDARD
// ==============================

function preloadGame() {
  catSheet = loadImage(
    'cat_sheet.png',
    function () { catSheetLoaded = true; },
    function () { catSheetLoaded = false; catSheet = null; }
  );

  ownerSheet = loadImage(
    'owner_sheet.png',
    function () { ownerSheetLoaded = true; },
    function () { ownerSheetLoaded = false; ownerSheet = null; }
  );

  bgStage1 = loadImage(
    'bg_stage1_ref.png',
    function () { bgStage1Loaded = true; },
    function () { bgStage1Loaded = false; bgStage1 = null; }
  );

  bgStage2Upper = loadImage(
    'bg_stage2_upper.png',
    function () { bgStage2UpperLoaded = true; },
    function () { bgStage2UpperLoaded = false; bgStage2Upper = null; }
  );

  bgStage2Mid = loadImage(
    'bg_stage2_mid.png',
    function () { bgStage2MidLoaded = true; },
    function () { bgStage2MidLoaded = false; bgStage2Mid = null; }
  );

  bgStage2Lower = loadImage(
    'bg_stage2_lower.png',
    function () { bgStage2LowerLoaded = true; },
    function () { bgStage2LowerLoaded = false; bgStage2Lower = null; }
  );
}

function drawAtlasFrame(sheet, frame, cellW, cellH, cols, drawX, drawY, drawW, drawH) {
  let sx = (frame.i % cols) * cellW;
  let sy = floor(frame.i / cols) * cellH;
  image(sheet, drawX, drawY, drawW, drawH, sx, sy, cellW, cellH);
}

function setupGame() {
  // 도트 이미지가 흐릿하게 보이지 않게 고정합니다.
  pixelDensity(1);
  let canvas = createCanvas(600, 800);
  noSmooth();
  let holder = select('#game-container');
  if (holder) {
    canvas.parent('game-container');
  }

  textAlign(CENTER, CENTER);
  imageMode(CENTER);
  rectMode(CORNER);

  generateBackground();
  particles = new ParticleSystem();

  player = new Player(600 / 2, 120);
}

function drawGame() {
  push();

  if (player && player.slowTimer > 0) {
    push();
    noStroke();
    fill(80, 160, 255, 210);
    textFont('sans-serif');
    textAlign(CENTER, CENTER);
    textSize(13);
    text('느려짐', 600 / 2, 70);
    pop();
  }

  if (screenShake > 0.1) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.86;
  }

  if (gameState === 'START') {
    drawStartScene();
  } else if (gameState === 'PLAYING') {
    drawPlayingScene();
  } else if (gameState === 'STORY') {
    drawBetweenStoryScene();
  } else if (gameState === 'GAMEOVER') {
    drawGameOverScene();
  } else if (gameState === 'ENDING') {
    drawEndingScene();
  }

  pop();

  if (flashOverlayAlpha > 0) {
    noStroke();
    fill(255, 70, 80, flashOverlayAlpha);
    rect(0, 0, 600, 800);
    flashOverlayAlpha -= 9;
  }
}

function keyPressedGame() {
  if (gameState === 'START') {
    if (keyCode === ENTER) {
      startStage(1);
    }
  } else if (gameState === 'PLAYING') {
    if (keyCode === ESCAPE) {
      gamePauseMenuOpen = !gamePauseMenuOpen;
      return;
    }
    if (guideOverlayTimer > 0 && keyCode === ENTER) {
      guideOverlayTimer = 0;
      return;
    }
    if (!gamePauseMenuOpen && (key === ' ' || keyCode === 32)) {
      player.jump();
    }
  } else if (gameState === 'STORY') {
    if (keyCode === ENTER && storyTimer > 30) {
      startStage(2);
    }
  } else if (gameState === 'GAMEOVER') {
    let passed = frameCount - gameOverEnterFrame;
    if (passed >= 310 && (key === 'r' || key === 'R')) {
      startStage(gameOverStage || stage);
    }
    if (passed >= 310 && keyCode === ESCAPE) {
      gameState = 'START';
      currentScene = 'TITLE';
      currentScreen = 'title';
      cameraY = 0;
      memoryCollected = 0;
      particles.clear();
      player = new Player(600 / 2, 120);
    }
  } else if (gameState === 'ENDING') {
    if (key === 'r' || key === 'R') {
      gameState = 'START';
      particles.clear();
      cameraY = 0;
      player = new Player(600 / 2, 120);
    }
  }
}

// ==============================
// GAME FLOW
// ==============================


function startStage(nextStage) {
  stage = nextStage;
  gameState = 'PLAYING';
  gamePauseMenuOpen = false;
  gameOverEnterFrame = 0;
  gameOverStage = stage;

  platforms = [];
  memoryItems = [];
  obstacles = [];

  cameraY = 0;
  lastSpawnY = 200;
  platformIndex = 0;
  missedMemorySpawnCount = 0;
  warningTimer = 0;
  screenShake = 0;
  flashOverlayAlpha = 0;
  stageClearCountdown = -1;
  activeMemoryText = '';
  memoryTextTimer = 0;
  guideOverlayTimer = 0;

  player = new Player(600 / 2, 100);
  player.hearts = 3;

  if (stage === 1) {
    memoryCollected = 0;
    player.memory = 0.0;
  } else {
    memoryCollected = MEMORY_TARGET;
    player.memory = 1.0;
  }

  particles.clear();

  platforms.push(new Platform(600 / 2, 210, 180, 22, stage === 1 ? 'normal' : 'cloud'));

  for (let i = 0; i < 10; i++) {
    spawnNextPlatform();
  }
}


function enterBetweenStory() {
  gameState = 'STORY';
  storyTimer = 0;
  particles.clear();
  screenShake = 0;
  flashOverlayAlpha = 0;
}

function triggerEnding() {
  gameState = 'ENDING';
  endingStage = 0;
  endingTimer = 0;
  particles.clear();

  player.vx = 0;
  player.vy = 0;
  player.memory = 1.0;
  player.hearts = 3;
}

// ==============================
// WORLD GENERATION
// ==============================


function spawnNextPlatform() {
  platformIndex++;

  let gap = stage === 1 ? random(90, 112) : random(98, 132);
  lastSpawnY += gap;

  if (stage === 1 && lastSpawnY > STAGE1_GATE_Y - 390) return;
  if (stage === 2 && lastSpawnY > STAGE2_EARTH_Y - 300) return;

  let px = random(78, 600 - 78);
  let pw = stage === 1 ? random(132, 176) : random(160, 220);
  let ph = 21;
  let type = 'normal';

  if (stage === 1) {
    if (random() < 0.15) type = 'storm';
    else if (platformIndex % 7 === 0) type = 'cloudboost';
    else if (platformIndex % 5 === 0) type = 'heaven';
    else type = 'normal';

    if (platformIndex % 2 === 0 || random() < 0.62) {
      px = random([82, 128, 472, 518]);
    } else {
      px = random([210, 300, 390]);
    }
  } else {
    let descent = lastSpawnY / STAGE2_EARTH_Y;

    if (descent < 0.26) {
      type = random(['cloud', 'cloud', 'cloud', 'pigeon', 'plane']);
      px = random([90, 145, 455, 510, 300]);
    } else if (descent < 0.46) {
      type = random(['cloud', 'cloud', 'cloud', 'pigeon']);
      px = random([85, 140, 460, 515, 300]);
    } else if (descent < 0.70) {
      type = random(['sign', 'sign', 'cloud', 'cloud', 'pigeon']);
      if (type === 'sign') {
        pw = random(160, 210);
        px = random([90, 145, 455, 510]);
      } else {
        px = random([85, 145, 455, 515, 300]);
      }
    } else {
      type = random(['sign', 'sign', 'neon', 'cloud', 'pigeon']);
      if (type === 'sign' || type === 'neon') {
        pw = random(165, 220);
        px = random([85, 140, 460, 515]);
      } else {
        px = random([90, 145, 455, 510, 300]);
      }
    }
  }

  platforms.push(new Platform(px, lastSpawnY, pw, ph, type));

  if (stage === 1 && random() < 0.55 && lastSpawnY < STAGE1_GATE_Y - 450) {
    let sideX = px < 300 ? random([440, 505]) : random([95, 160]);
    let extraType = random(['normal', 'normal', 'heaven', 'cloudboost']);
    platforms.push(new Platform(sideX, lastSpawnY + random(32, 54), random(118, 154), ph, extraType));
  }

  if (stage === 2 && random() < 0.34 && lastSpawnY < STAGE2_EARTH_Y - 520) {
    let descent = lastSpawnY / STAGE2_EARTH_Y;
    let sideX = px < 300 ? random([440, 508]) : random([92, 160]);
    let extraType = descent < 0.50 ? random(['cloud', 'cloud', 'pigeon']) : random(['sign', 'cloud', 'pigeon']);
    let extraW = extraType === 'sign' ? random(150, 190) : random(135, 175);
    platforms.push(new Platform(sideX, lastSpawnY + random(32, 56), extraW, ph, extraType));
  }

  if (stage === 2 && lastSpawnY / STAGE2_EARTH_Y > 0.38 && random() < 0.24 && lastSpawnY < STAGE2_EARTH_Y - 520) {
    let descent = lastSpawnY / STAGE2_EARTH_Y;
    let midType = descent > 0.50 ? random(['cloud', 'sign', 'sign']) : random(['cloud', 'cloud', 'pigeon']);
    let midW = midType === 'sign' ? random(150, 205) : random(138, 182);
    platforms.push(new Platform(random([245, 300, 355]), lastSpawnY + random(58, 82), midW, ph, midType));
  }

  if (stage === 1) {
    if (type !== 'storm' && memoryCollected < MEMORY_TARGET) {
      let shouldForceMemory = missedMemorySpawnCount >= 1;
      let memoryChance = shouldForceMemory ? 1.0 : 0.70;
      if (random() < memoryChance) {
        memoryItems.push(new MemoryItem(px + random(-20, 20), lastSpawnY - 42));
        missedMemorySpawnCount = 0;
      } else {
        missedMemorySpawnCount++;
      }
    }

    let obstacleChance = type === 'storm' ? 0.16 : 0.22;
    if (random() < obstacleChance) {
      obstacles.push(new ObstacleItem(px + random(-38, 38), lastSpawnY - random(50, 78), stage));
    }
  } else {
    let obstacleChance = lastSpawnY / STAGE2_EARTH_Y < 0.45 ? 0.36 : 0.52;
    if (random() < obstacleChance) {
      let ox = type === 'sign' || type === 'neon' ? px + random(-22, 22) : px + random(-46, 46);
      obstacles.push(new ObstacleItem(ox, lastSpawnY - random(48, 86), stage));
    }
  }
}


function generateBackground() {
  stars = [];
  for (let i = 0; i < 85; i++) {
    stars.push({
      x: random(600),
      y: random(800),
      size: random(1, 3.5),
      phase: random(TWO_PI),
      speed: random(0.008, 0.035)
    });
  }

  highClouds = [];
  for (let i = 0; i < 20; i++) {
    highClouds.push({
      x: random(-100, 600 + 100),
      y: random(0, 800),
      w: random(110, 260),
      h: random(30, 70),
      speed: random(0.05, 0.18),
      alpha: random(18, 60)
    });
  }

  mountains = [];
  for (let i = 0; i < 13; i++) {
    mountains.push({
      x: map(i, 0, 12, -60, 600 + 60),
      w: random(160, 310),
      h: random(75, 170)
    });
  }

  cityBackdrop = [];
  for (let i = 0; i < 30; i++) {
    cityBackdrop.push({
      x: random(-40, 600 + 40),
      w: random(35, 95),
      h: random(90, 270),
      lit: random() < 0.75,
      layer: random(0.2, 1.0)
    });
  }

  worldBuildings = [];
  let y = 350;
  while (y < STAGE2_EARTH_Y + 450) {
    let side = random() < 0.5 ? 'left' : 'right';
    worldBuildings.push({
      x: side === 'left' ? random(-50, 90) : random(600 - 95, 600 + 45),
      y: y + random(-40, 40),
      w: random(60, 135),
      h: random(200, 520),
      lit: random() < 0.70,
      shade: random(0.0, 1.0)
    });
    y += random(135, 230);
  }
}

// ==============================
// SCENES
// ==============================

function drawStartScene() {
  drawTitlePixelBackground();

  push();
  drawingContext.shadowBlur = 22;
  drawingContext.shadowColor = color(145, 220, 255, 180);
  fill(255);
  noStroke();
  textSize(42);
  textFont('serif');
  text('마지막 인사', 600 / 2, 130);

  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = color(255, 190, 220, 120);
  fill(225, 240, 255);
  textSize(20);
  text('Heavenly Descent', 600 / 2, 176);
  pop();

  let catY = 285 + sin(frameCount * 0.045) * 14;
  drawCatVisual(600 / 2, catY, 1.45, 1, 0.0, 110, 0, 0, 0, false);

  push();
  rectMode(CENTER);
  noStroke();
  fill(12, 18, 40, 170);
  rect(600 / 2, 535, 500, 310, 18);

  stroke(255, 255, 255, 35);
  noFill();
  rect(600 / 2, 535, 500, 310, 18);

  // 중요: 위에서 rectMode(CENTER)를 켠 상태라 그대로 text(..., w, h)를 쓰면
  // p5.js가 글상자를 가운데 기준으로 잡아서 왼쪽이 잘릴 수 있습니다.
  // 글 설명은 반드시 CORNER 기준으로 바꾼 뒤 그립니다.
  rectMode(CORNER);

  noStroke();
  textAlign(LEFT, TOP);
  textFont('sans-serif');
  textSize(14);
  textLeading(21);
  fill(235, 243, 255);

  let story =
    '유기묘였던 나비는 드디어 따뜻한 주인을 만났습니다.\n' +
    '하지만 어느 날, 주인이 잠깐 한눈을 판 사이\n' +
    '나비는 너무 갑작스럽게 세상을 떠났습니다.\n\n' +
    '천국에 남은 나비는 자신의 기억을 잃은 채\n' +
    '울고 있는 주인을 내려다봅니다.\n' +
    '마지막 인사를 전하기 위해, 나비는 지상으로 내려가려 합니다.';

  text(story, 90, 390, 420, 150);

  stroke(255, 255, 255, 30);
  line(90, 552, 510, 552);

  noStroke();
  textSize(13);
  textLeading(19);
  fill(205, 224, 255);
  let inst =
    '조작: ←/→ 또는 A/D로 좌우 이동\n' +
    '발판을 밟으면 자동으로 점프합니다. SPACE는 사용하지 않아도 됩니다.\n' +
    '1스테이지: 3분 안에 기억조각 18개를 모으고 천국문까지 내려가야 합니다.\n' +
    '먹구름은 높이 튕겨 올려 시간을 빼앗고, 검은 깃털은 하트를 깎습니다.\n' +
    '2스테이지: 기억조각 없이 장애물을 피해 지상까지 내려갑니다.';
  text(inst, 90, 570, 420, 110);

  textAlign(CENTER, CENTER);
  textFont('serif');
  let a = map(sin(frameCount * 0.09), -1, 1, 110, 255);
  fill(255, 255, 255, a);
  textSize(24);
  text('ENTER를 눌러 시작하기', 600 / 2, 715);
  pop();

  particles.update();
  particles.draw();
}

function drawBetweenStoryScene() {
  storyTimer++;

  drawTitlePixelBackground();

  let glow = min(255, storyTimer * 3);

  push();
  noStroke();
  textFont('serif');
  textAlign(CENTER, CENTER);

  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = color(255, 230, 140, glow);
  fill(255, 245, 190, glow);
  textSize(30);
  text('기억이 모두 돌아왔다', 600 / 2, 160);

  drawingContext.shadowBlur = 0;
  fill(235, 240, 255, glow);
  textSize(18);

  let story =
    '흩어진 기억조각들이 하나로 이어졌다.\n\n' +
    '따뜻했던 방, 창가의 햇빛,\n' +
    '목걸이의 작은 방울 소리,\n' +
    '그리고 끝까지 나를 사랑해 주던 너.\n\n' +
    '“미안해하지 마. 나는 행복했어.”\n' +
    '이제 나비는 망설이지 않고\n' +
    '주인이 있는 지상으로 더 내려간다.';

  text(story, 600 / 2, 355);

  drawCatVisual(600 / 2, 600 + sin(frameCount * 0.04) * 6, 1.35, 1, 1.0, 255, 0, 0, 0, false);

  let promptAlpha = storyTimer > 70 ? map(sin(frameCount * 0.08), -1, 1, 80, 255) : 0;
  fill(255, 255, 255, promptAlpha);
  textSize(23);
  text('ENTER를 눌러 2스테이지로', 600 / 2, 725);
  pop();

  if (storyTimer > 620) {
    startStage(2);
  }
}




function isNearHeavenGatePlatform(p) {
  return stage === 1 && p && p.y > STAGE1_GATE_Y - 470 && p.y < STAGE1_GATE_Y + 240;
}

function isPlayerInsideHeavenGate() {
  if (!player) return false;

  let insideX = player.x > 238 && player.x < 362;
  let insideY = player.y > STAGE1_GATE_Y - 95 && player.y < STAGE1_GATE_Y + 150;

  return insideX && insideY;
}

function handleStage1GateBoundary() {
  if (stage !== 1 || !player) {
    return;
  }

  let barrierY = STAGE1_GATE_Y + 140;

  if (player.y >= barrierY) {
    if (memoryCollected >= MEMORY_TARGET && isPlayerInsideHeavenGate()) {
      return;
    }

    player.y = barrierY;
    player.vy = min(player.vy, -4.8);

    if (memoryCollected < MEMORY_TARGET) {
      gameState = 'BAD_GATE';
      activeMemoryText = '기억조각이 부족한 채 지상문에 닿았다.';
      memoryTextTimer = 180;
    } else {
      activeMemoryText = '지상문 안쪽으로 정확히 들어가야 해.';
      memoryTextTimer = 120;
    }
  }
}


function triggerConnectionBreak(text, power) {
  connectionBreakTimer = 120;
  connectionBreakPower = power || 1;
  connectionBreakText = text || '너무 높이 올라갔어';

  // 양옆 빨간 연출은 제거하고 흔들림만 약하게 남김
  screenShake = max(screenShake, 16 + connectionBreakPower * 6);
  flashOverlayAlpha = max(flashOverlayAlpha, 28 + connectionBreakPower * 10);
  activeMemoryText = connectionBreakText;
  memoryTextTimer = 120;
}


function registerBlackCloudBounce() {
  blackCloudBounceCount++;
  blackCloudBounceTimer = 210;

  if (blackCloudBounceCount <= 1) {
    triggerConnectionBreak('먹구름에 튕겼어', 0.50);
  } else if (blackCloudBounceCount === 2) {
    triggerConnectionBreak('먹구름을 또 밟았어', 0.70);
  } else {
    triggerConnectionBreak('너무 높이 올라갔어', 0.95);
    offscreenHighTimer += 45;

    
  }
}


function drawConnectionBreakEffect() {
  if (connectionBreakTimer <= 0) {
    return;
  }

  let t = connectionBreakTimer;
  connectionBreakTimer--;

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');
  noStroke();

  let alphaVal = constrain(map(t, 0, 120, 0, 190), 0, 190);

  fill(8, 10, 18, alphaVal * 0.78);
  rect(300, 76, 260, 32, 14);

  fill(255, 246, 235, alphaVal + 45);
  textSize(14);
  text(connectionBreakText, 300, 76);

  pop();
}



function drawStageIntroScene() {
  let total = 150;
  let elapsed = total - stageIntroTimer;
  let fadeInBlack = constrain(map(elapsed, 0, 35, 0, 255), 0, 255);
  let holdBlack = elapsed > 35 && elapsed < 92 ? 255 : 0;
  let fadeOutBlack = constrain(map(elapsed, 92, 150, 255, 0), 0, 255);
  let blackAlpha = max(fadeInBlack, holdBlack, fadeOutBlack);

  // 뒤쪽 실제 스테이지는 미리 그려 두고 검은 화면이 서서히 걷히게 함
  if (stage === 1) {
    drawStage1Background();
  } else {
    drawStage2Background();
  }

  push();
  translate(0, -cameraY);
  for (let p of platforms) {
    p.draw();
  }
  for (let item of memoryItems) {
    item.draw();
  }
  for (let ob of obstacles) {
    ob.draw();
  }
  if (player) {
    player.draw();
  }
  pop();

  push();
  rectMode(CORNER);
  noStroke();
  fill(0, blackAlpha);
  rect(0, 0, 600, 800);

  let textAlpha = elapsed < 35 ? map(elapsed, 0, 35, 0, 255) : elapsed > 105 ? map(elapsed, 105, 150, 255, 0) : 255;
  textAlign(CENTER, CENTER);
  textFont('serif');
  fill(255, 246, 230, textAlpha);
  textSize(32);
  text(stage === 1 ? '천국으로 가는 중...' : '지상으로 내려가는 중...', 300, 360);

  textFont('Noto Sans KR, Pretendard, sans-serif');
  textSize(15);
  fill(255, 246, 230, textAlpha * 0.72);
  text('잠시 후 시작됩니다', 300, 410);

  noFill();
  stroke(255, 246, 230, textAlpha * 0.60);
  strokeWeight(3);
  let r = 22;
  arc(300, 462, r, r, frameCount * 0.12, frameCount * 0.12 + PI * 1.35);
  pop();

  stageIntroTimer--;
}



function drawGameSettingsButton() {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  let hover = isGameMouseOnRect(548, 78, 76, 34);
  noStroke();
  fill(20, 24, 38, hover ? 205 : 165);
  rect(548, 78, 76, 34, 13);

  stroke(255, 246, 230, hover ? 210 : 150);
  strokeWeight(1.5);
  noFill();
  rect(548, 78, 76, 34, 13);

  noStroke();
  fill(255, 246, 230, 230);
  textSize(14);
  text('설정', 548, 78);
  pop();
}

function drawPauseMenu() {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  noStroke();
  fill(0, 0, 0, 95);
  rect(300, 400, 600, 800);

  fill(255, 250, 232, 238);
  rect(300, 392, 410, 390, 28);

  stroke(255, 255, 255, 150);
  strokeWeight(2);
  noFill();
  rect(300, 392, 392, 372, 24);

  noStroke();
  fill(68, 56, 86);
  textSize(30);
  text('일시정지', 300, 245);

  drawPauseVolumeControl(300, 325);

  drawPauseMenuButton(300, 430, 250, 56, '계속하기');
  drawPauseMenuButton(300, 505, 250, 56, '게임 나가기');

  pop();
}

function drawPauseVolumeControl(x, y) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  noStroke();
  fill(255, 255, 252, 180);
  rect(x, y, 300, 72, 18);

  fill(72, 58, 90);
  textSize(17);
  text('음악 소리', x, y - 18);

  let percent = typeof getBgmVolumePercent === 'function' ? getBgmVolumePercent() : 42;
  fill(92, 76, 108);
  textSize(18);
  text(percent + '%', x, y + 18);

  drawPauseSmallButton(x - 110, y + 18, 42, 34, '-');
  drawPauseSmallButton(x + 110, y + 18, 42, 34, '+');

  pop();
}

function drawPauseSmallButton(x, y, w, h, label) {
  let hover = isGameMouseOnRect(x, y, w, h);

  noStroke();
  fill(72, 60, 90, hover ? 238 : 205);
  rect(x, y, w, h, 12);

  stroke(255, 246, 230, hover ? 180 : 90);
  strokeWeight(1.4);
  noFill();
  rect(x, y, w, h, 12);

  noStroke();
  fill(255, 246, 230);
  textSize(20);
  text(label, x, y - 1);
}

function drawPauseMenuButton(x, y, w, h, label) {
  let hover = isGameMouseOnRect(x, y, w, h);

  if (label === '게임 나가기') {
    fill(95, 72, 90, hover ? 235 : 205);
  } else {
    fill(70, 58, 90, hover ? 238 : 210);
  }

  noStroke();
  rect(x, y, w, h, 18);

  stroke(255, 246, 230, hover ? 180 : 95);
  strokeWeight(1.5);
  noFill();
  rect(x, y, w, h, 18);

  noStroke();
  fill(255, 246, 230, 235);
  textSize(18);
  text(label, x, y);
}

function drawPausedPlayingScene() {
  if (stage === 1) {
    drawStage1Background();
  } else {
    drawStage2Background();
  }

  push();
  translate(0, -cameraY);

  if (stage === 1) {
    drawHeavenGate();
  } else {
    drawWorldBuildings();
    drawGround();
  }

  for (let p of platforms) {
    p.draw();
  }
  for (let item of memoryItems) {
    item.draw();
  }
  for (let ob of obstacles) {
    ob.draw();
  }
  particles.draw();
  player.draw();

  pop();

  drawHUD();
  drawGameSettingsButton();
  drawPauseMenu();
}

function handleGameMousePressed() {
  let gm = getGameMousePosition();
  if (!gm || gm.x < 0 || gm.x > 600 || gm.y < 0 || gm.y > 800) {
    return false;
  }

  if (gameState === 'GAMEOVER') {
    let passed = frameCount - gameOverEnterFrame;
    if (passed < 310) {
      return true;
    }

    if (isGameMouseOnRect(145, 445, 230, 66)) {
      startStage(gameOverStage || stage);
      return true;
    }
    if (isGameMouseOnRect(455, 445, 230, 66)) {
      gameState = 'START';
      currentScene = 'TITLE';
      currentScreen = 'title';
      cameraY = 0;
      memoryCollected = 0;
      particles.clear();
      player = new Player(600 / 2, 120);
      return true;
    }
    return true;
  }

  if (gamePauseMenuOpen) {
    if (isGameMouseOnRect(190, 343, 42, 34)) {
      if (typeof setBgmVolume === 'function') {
        setBgmVolume((typeof bgmVolume === 'number' ? bgmVolume : 0.42) - 0.1);
      }
      return true;
    }

    if (isGameMouseOnRect(410, 343, 42, 34)) {
      if (typeof setBgmVolume === 'function') {
        setBgmVolume((typeof bgmVolume === 'number' ? bgmVolume : 0.42) + 0.1);
      }
      return true;
    }

    if (isGameMouseOnRect(300, 430, 250, 56)) {
      gamePauseMenuOpen = false;
      return true;
    }

    if (isGameMouseOnRect(300, 505, 250, 56)) {
      gamePauseMenuOpen = false;
      gameState = 'START';
      currentScene = 'TITLE';
      currentScreen = 'title';
      cameraY = 0;
      memoryCollected = 0;
      particles.clear();
      player = new Player(600 / 2, 120);
      return true;
    }

    return true;
  }

  if (isGameMouseOnRect(548, 78, 76, 34)) {
    gamePauseMenuOpen = true;
    return true;
  }

  return false;
}

function isGameMouseOnRect(x, y, w, h) {
  let gm = getGameMousePosition();
  if (!gm) return false;
  return gm.x > x - w / 2 && gm.x < x + w / 2 && gm.y > y - h / 2 && gm.y < y + h / 2;
}


function drawPlayingScene() {
  if (gamePauseMenuOpen) {
    drawPausedPlayingScene();
    return;
  }

  if (stageIntroTimer > 0) {
    drawStageIntroScene();
    return;
  }

  player.update();

  if (blackCloudBounceTimer > 0) {
    blackCloudBounceTimer--;
  } else {
    blackCloudBounceCount = 0;
  }

  handleStage1GateBoundary();

  let targetCam = max(0, player.y - 800 * 0.35);
  let camEase = targetCam < cameraY ? 0.12 : 0.08;
  cameraY = lerp(cameraY, targetCam, camEase);

  while (lastSpawnY < cameraY + 800 + 300) {
    if (stage === 1 && lastSpawnY > STAGE1_GATE_Y - 390) {
      break;
    }
    if (stage === 2 && lastSpawnY > STAGE2_EARTH_Y - 300) {
      break;
    }
    spawnNextPlatform();
  }

  for (let p of platforms) {
    player.checkPlatformCollision(p);
  }

  for (let item of memoryItems) {
    if (!item.collected && item.checkCollision(player)) {
      player.collectMemory();
    }
  }

  for (let ob of obstacles) {
    if (!ob.collected && ob.checkCollision(player)) {
      player.takeDamage(ob);
    }
  }

  platforms = platforms.filter(function (p) {
    return p.y > cameraY - 160 && !isNearHeavenGatePlatform(p);
  });
  memoryItems = memoryItems.filter(function (m) {
    return m.y > cameraY - 170 && !m.collected;
  });
  obstacles = obstacles.filter(function (o) {
    return o.y > cameraY - 190 && !o.collected;
  });

  if (stage === 1) {
    drawStage1Background();
  } else {
    drawStage2Background();
  }

  push();
  translate(0, -cameraY);

  if (stage === 1) {
    drawHeavenGate();
  } else {
    drawWorldBuildings();
    drawGround();
  }

  for (let p of platforms) {
    p.update();
    p.draw();
  }

  for (let item of memoryItems) {
    item.update();
    item.draw();
  }

  for (let ob of obstacles) {
    ob.update();
    ob.draw();
  }

  particles.update();
  particles.draw();

  player.draw();

  pop();

  drawHUD();
  drawOffscreenWarning();
  drawMemoryTextOverlay();
  drawStageClearOverlay();
  drawConnectionBreakEffect();
  drawGameSettingsButton();

  if (stage === 1 && memoryCollected >= MEMORY_TARGET && isPlayerInsideHeavenGate() && stageClearCountdown < 0) {
    stageClearCountdown = 145;
    activeMemoryText = '문이 열렸다. 이제 지상으로 내려갈 수 있어.';
    memoryTextTimer = 170;
  }

  if (stage === 1 && stageClearCountdown > 0) {
    stageClearCountdown--;
    if (stageClearCountdown <= 0) {
      enterBetweenStory();
    }
  }

  if (stage === 2 && player.y >= STAGE2_EARTH_Y - player.radius - 1) {
    triggerEnding();
  }
}


function triggerGameOver() {
  if (gameState !== 'GAMEOVER') {
    gameState = 'GAMEOVER';
    gameOverEnterFrame = frameCount;
    gameOverStage = stage;
    gamePauseMenuOpen = false;
  }
}

function drawGameOverScene() {
  if (!gameOverEnterFrame) {
    gameOverEnterFrame = frameCount;
    gameOverStage = stage;
  }

  let passed = frameCount - gameOverEnterFrame;
  let img = gameOverStage === 2 ? ending3Img : ending2Img;

  let titleText = gameOverStage === 2 ? '엔딩 3 · 떠돌이 영혼' : '엔딩 2 · 천국으로 돌아가다';
  let descText = gameOverStage === 2
    ? '지상에 가까워졌지만 마지막 힘이 다했다.\n고양이는 거리의 바람 속에서 주인의 집을 계속 찾는다.'
    : '꿈에서 닿을 듯했던 세상은 멀어지고 말았다.\n고양이는 다시 천국의 길목으로 돌아갔다.';

  let imgAlpha = constrain(map(passed, 0, 70, 0, 255), 0, 255);
  let textAlpha = constrain(map(passed, 45, 115, 0, 255), 0, 255);
  let endingTextFade = constrain(map(passed, 205, 270, 1, 0), 0, 1);
  let blackAlpha = constrain(map(passed, 230, 335, 0, 245), 0, 245);
  let choiceAlpha = constrain(map(passed, 310, 410, 0, 255), 0, 255);

  push();
  imageMode(CORNER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  if (img && img.width > 0) {
    tint(255, imgAlpha);
    drawCoverImage(img, 0, 0, 600, 800);
    noTint();
  } else {
    drawTitlePixelBackground();
  }

  noStroke();
  fill(0, 0, 0, 95 * (imgAlpha / 255));
  rect(300, 400, 600, 800);

  let panelY = 565;
  fill(0, 0, 0, 152 * (textAlpha / 255) * endingTextFade);
  rect(300, panelY, 540, 150, 18);

  fill(255, 245, 232, textAlpha * endingTextFade);
  textFont('serif');
  textSize(34);
  text(titleText, 300, panelY - 28);

  let parts = String(descText).split('\n');
  fill(255, 245, 232, textAlpha * 0.95 * endingTextFade);
  textSize(19);
  if (parts.length > 0) text(parts[0], 300, panelY + 8);
  fill(255, 245, 232, textAlpha * 0.78 * endingTextFade);
  textSize(15);
  if (parts.length > 1) text(parts.slice(1).join(' '), 300, panelY + 42);

  fill(0, 0, 0, blackAlpha);
  rect(300, 400, 600, 800);

  if (choiceAlpha > 0) {
    drawGameOverAfterChoice(choiceAlpha);
  }

  pop();
}

function drawGameOverAfterChoice(alphaValue) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  textFont('serif');
  fill(255, 246, 230, alphaValue);
  textSize(46);
  text('아직 끝나지 않았어.', 300, 285);

  textFont('Noto Sans KR, Pretendard, sans-serif');
  fill(255, 246, 230, alphaValue * 0.82);
  textSize(18);
  text('다시 한 번, 너를 만나러 가볼까?', 300, 342);

  drawGameOverButton(145, 445, 230, 66, '게임 다시하기', alphaValue);
  drawGameOverButton(455, 445, 230, 66, '포기하기', alphaValue);

  fill(255, 246, 230, alphaValue * 0.58);
  textSize(14);
  text('R : 다시하기  ·  ESC : 포기하기', 300, 520);

  pop();
}

function drawGameOverButton(x, y, w, h, label, alphaValue) {
  let hover = alphaValue > 180 && isGameMouseOnRect(x, y, w, h);

  noStroke();
  fill(label === '포기하기' ? color(84, 66, 82, hover ? alphaValue : alphaValue * 0.74) : color(72, 60, 90, hover ? alphaValue : alphaValue * 0.78));
  rect(x, y, w, h, 18);

  stroke(255, 246, 230, hover ? alphaValue : alphaValue * 0.48);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 18);

  noStroke();
  fill(255, 246, 230, alphaValue);
  textFont('Noto Sans KR, Pretendard, sans-serif');
  textSize(20);
  text(label, x, y);
}

function drawGameOverAfterChoice(alphaValue) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  textFont('serif');
  fill(255, 246, 230, alphaValue);
  textSize(46);
  text('아직 끝나지 않았어.', 300, 285);

  textFont('Noto Sans KR, Pretendard, sans-serif');
  fill(255, 246, 230, alphaValue * 0.82);
  textSize(18);
  text('다시 한 번, 너를 만나러 가볼까?', 300, 342);

  drawGameOverButton(145, 445, 230, 66, '게임 다시하기', alphaValue);
  drawGameOverButton(455, 445, 230, 66, '포기하기', alphaValue);

  fill(255, 246, 230, alphaValue * 0.58);
  textSize(14);
  text('R : 다시하기  ·  ESC : 포기하기', 300, 520);

  pop();
}

function drawGameOverButton(x, y, w, h, label, alphaValue) {
  let hover = alphaValue > 180 && isGameMouseOnRect(x, y, w, h);

  noStroke();
  fill(label === '포기하기' ? color(84, 66, 82, hover ? alphaValue : alphaValue * 0.74) : color(72, 60, 90, hover ? alphaValue : alphaValue * 0.78));
  rect(x, y, w, h, 18);

  stroke(255, 246, 230, hover ? alphaValue : alphaValue * 0.48);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 18);

  noStroke();
  fill(255, 246, 230, alphaValue);
  textFont('Noto Sans KR, Pretendard, sans-serif');
  textSize(20);
  text(label, x, y);
}

function drawGameOverButton(x, y, w, h, label) {
  let hover = isGameMouseOnRect(x, y, w, h);
  noStroke();
  fill(label === '홈 화면으로' ? color(92, 72, 92, hover ? 238 : 205) : color(70, 58, 90, hover ? 238 : 210));
  rect(x, y, w, h, 18);

  stroke(255, 246, 230, hover ? 190 : 110);
  strokeWeight(1.5);
  noFill();
  rect(x, y, w, h, 18);

  noStroke();
  fill(255, 246, 230);
  textFont('Noto Sans KR, Pretendard, sans-serif');
  textSize(18);
  text(label, x, y);
}

function drawEndingScene() {
  endingTimer++;

  if (!(bgStage2LowerLoaded && drawPixelBackgroundImage(bgStage2Lower, true))) {
    drawGradientBackground(color('#171b33'), color('#c97569'));
  }

  drawEndingPark();

  let groundY = 800 - 125;

  if (endingStage === 0) {
    drawOwner(ownerX, groundY, 'sad', endingTimer);

    let t = min(1, endingTimer / 250);
    let catX = lerp(80, ownerX - 42, smoothStep(t));
    let catY = groundY - 37;
    drawCatVisual(catX, catY, 1.22, 1, 1.0, 255, 1.8, 0, frameCount * 0.16, false);

    if (frameCount % 10 === 0) {
      particles.add(new Particle(catX, catY + 20, 'sparkle'));
    }

    drawEndingText('주인... 나 왔어.', 625, endingTimer, 35);

    if (endingTimer > 280) {
      endingStage = 1;
      endingTimer = 0;
    }
  } else if (endingStage === 1) {
    let usedCombinedHugSprite = drawOwner(ownerX, groundY, 'hug', endingTimer);
    if (!usedCombinedHugSprite) {
      drawCatVisual(ownerX - 18, groundY - 83, 1.08, 1, 1.0, 255, 0, 0, 0, false);
    }

    if (frameCount % 8 === 0) {
      particles.add(new Particle(ownerX - 20 + random(-8, 8), groundY - 85 + random(-8, 8), 'heart'));
    }

    drawEndingText('“나비야...? 정말 너야?”\n주인은 울면서도 웃으며 나비를 꼭 안아 주었다.', 620, endingTimer, 30);

    if (endingTimer > 275) {
      endingStage = 2;
      endingTimer = 0;
    }
  } else if (endingStage === 2) {
    drawOwner(ownerX, groundY, 'reach', endingTimer);

    let t = min(1, endingTimer / 260);
    let alpha = lerp(255, 45, t);
    let catX = ownerX - 18 + sin(frameCount * 0.04) * 8;
    let catY = lerp(groundY - 83, 180, smoothStep(t));

    drawCatVisual(catX, catY, 1.05, 1, 1.0, alpha, 0, -2, 0, false);

    if (frameCount % 4 === 0) {
      particles.add(new Particle(catX + random(-12, 12), catY + random(-10, 14), 'sparkle'));
    }

    drawEndingText('“고마워. 이제 괜찮아.”\n나비는 다시 푸른빛으로 반짝이며 하늘로 올라갔다.', 620, endingTimer, 30);

    if (endingTimer > 285) {
      endingStage = 3;
      endingTimer = 0;
    }
  } else {
    drawOwner(ownerX, groundY, 'lookUp', endingTimer);

    let a = min(255, endingTimer * 3);
    push();
    textAlign(CENTER, CENTER);
    textFont('serif');
    noStroke();

    fill(255, 248, 220, a);
    textSize(31);
    text('ENDING: 마지막 인사', 600 / 2, 210);

    fill(235, 240, 255, a);
    textSize(18);
    let ep =
      '주인은 더 이상 혼자 울지 않았다.\n' +
      '품에 남은 온기와 작은 방울 소리는\n' +
      '나비가 정말 다녀갔다는 마지막 선물이었다.\n\n' +
      '나비는 천국으로 돌아갔지만,\n' +
      '둘의 기억은 이제 어느 쪽에서도 사라지지 않는다.';
    text(ep, 600 / 2, 360);

    let promptAlpha = map(sin(frameCount * 0.08), -1, 1, 80, 255);
    fill(255, 255, 255, min(promptAlpha, max(0, (endingTimer - 120) * 4)));
    textSize(22);
    text('R을 눌러 처음 화면으로', 600 / 2, 705);
    pop();
  }

  particles.update();
  particles.draw();
}

// ==============================
// BACKGROUND DRAWING
// ==============================

function drawPixelBackgroundImage(img, loaded) {
  if (!loaded || !img) {
    return false;
  }

  push();
  imageMode(CORNER);
  rectMode(CORNER);
  noTint();
  noSmooth();
  image(img, 0, 0, 600, 800);
  pop();
  return true;
}

function drawTitlePixelBackground() {
  if (drawPixelBackgroundImage(bgStage1, bgStage1Loaded)) {
    push();
    rectMode(CORNER);
    noStroke();
    // 타이틀/설명 글씨가 잘 보이도록 살짝 어둡게 덮습니다.
    fill(5, 8, 28, 92);
    rect(0, 0, 600, 800);
    pop();
    return;
  }

  drawGradientBackground(color('#061328'), color('#1e1742'));
  drawStarField(0.15);
  drawSoftHeavenClouds();
}

function drawGradientBackground(topC, bottomC) {
  noFill();
  for (let y = 0; y < 800; y += 4) {
    let t = map(y, 0, 800, 0, 1);
    stroke(lerpColor(topC, bottomC, t));
    strokeWeight(4);
    line(0, y, 600, y);
  }
}

function drawStage1Background() {
  let descent = constrain(cameraY / 4600, 0, 1);

  if (drawPixelBackgroundImage(bgStage1, bgStage1Loaded)) {
    // 내려갈수록 살짝 밝아지는 느낌만 투명 오버레이로 추가합니다.
    push();
    rectMode(CORNER);
    noStroke();
    fill(185, 220, 255, 28 * descent);
    rect(0, 0, 600, 800);
    fill(255, 226, 188, 40 * max(0, descent - 0.55));
    rect(0, 0, 600, 800);
    pop();
    return;
  }

  let topC = lerpColor(color('#061428'), color('#334f8d'), descent);
  let bottomC = lerpColor(color('#2e245d'), color('#d9eaff'), descent);

  drawGradientBackground(topC, bottomC);
  drawStarField(0.3 * (1 - descent));
  drawSoftHeavenClouds();

  push();
  noStroke();
  let moonAlpha = 190 * (1 - descent);
  fill(240, 250, 255, moonAlpha);
  ellipse(490, 110, 70, 70);
  fill(red(topC), green(topC), blue(topC), moonAlpha * 0.7);
  ellipse(510, 100, 65, 65);
  pop();
}

function drawStage2Background() {
  let descent = constrain(cameraY / STAGE2_EARTH_Y, 0, 1);

  if (bgStage2UpperLoaded && bgStage2Upper && bgStage2MidLoaded && bgStage2Mid && bgStage2LowerLoaded && bgStage2Lower) {
    push();
    imageMode(CORNER);
    noTint();
    image(bgStage2Upper, 0, 0, 600, 800);

    let midAlpha = constrain(map(descent, 0.22, 0.60, 0, 255), 0, 255);
    let lowAlpha = constrain(map(descent, 0.58, 0.92, 0, 255), 0, 255);

    if (midAlpha > 0) {
      tint(255, midAlpha);
      image(bgStage2Mid, 0, 0, 600, 800);
    }

    if (lowAlpha > 0) {
      tint(255, lowAlpha);
      image(bgStage2Lower, 0, 0, 600, 800);
    }

    noTint();
    noStroke();
    fill(6, 10, 20, 18 + 28 * descent);
    rect(0, 0, 600, 800);
    pop();
    return;
  }

  let topC = lerpColor(color('#283d73'), color('#101827'), descent);
  let bottomC = lerpColor(color('#d89588'), color('#34405c'), descent);

  drawGradientBackground(topC, bottomC);

  push();
  noStroke();
  fill(255, 202, 120, 90);
  ellipse(600 * 0.72, 150 + descent * 120, 130, 130);
  fill(255, 225, 170, 45);
  ellipse(600 * 0.72, 150 + descent * 120, 210, 210);
  pop();

  drawCityBackdrop(descent);
}

function drawStarField(parallax) {
  push();
  noStroke();
  for (let s of stars) {
    let y = (s.y - cameraY * parallax) % 800;
    if (y < 0) y += 800;
    let tw = map(sin(frameCount * s.speed + s.phase), -1, 1, 55, 230);
    fill(255, 255, 235, tw);
    ellipse(s.x, y, s.size, s.size);
  }
  pop();
}

function drawSoftHeavenClouds() {
  push();
  noStroke();
  for (let c of highClouds) {
    let x = (c.x + frameCount * c.speed) % (600 + 220) - 110;
    let y = (c.y - cameraY * 0.05) % 800;
    if (y < -80) y += 800 + 80;
    fill(255, 255, 255, c.alpha);
    ellipse(x, y, c.w, c.h);
    ellipse(x - c.w * 0.25, y + 8, c.w * 0.55, c.h * 0.8);
    ellipse(x + c.w * 0.28, y - 4, c.w * 0.52, c.h * 0.75);
  }
  pop();
}

function drawCityBackdrop(descent) {
  push();
  noStroke();

  let baseY = 800 - 70 + sin(frameCount * 0.01) * 4;

  fill(35, 44, 76, 130 + descent * 80);
  for (let m of mountains) {
    triangle(m.x - m.w / 2, 800 - 80, m.x, 800 - 80 - m.h * (0.55 + descent * 0.4), m.x + m.w / 2, 800 - 80);
  }

  for (let b of cityBackdrop) {
    let by = baseY - b.h * (0.75 + descent * 0.35) * b.layer;
    let shade = 25 + b.layer * 25;
    fill(shade, shade + 8, shade + 25, 120 + descent * 105);
    rect(b.x, by, b.w, 800 - by);

    if (b.lit) {
      fill(255, 225, 135, 80 + descent * 90);
      let cols = max(1, floor(b.w / 18));
      let rows = max(1, floor(b.h / 28));
      for (let cx = 0; cx < cols; cx++) {
        for (let ry = 0; ry < rows; ry++) {
          if (noise(cx * 3.1, ry * 2.7, b.x) > 0.43) {
            rect(b.x + 8 + cx * 16, by + 16 + ry * 24, 5, 8, 1);
          }
        }
      }
    }
  }

  pop();
}

function drawWorldBuildings() {
  // 배경 이미지를 그대로 살리기 위해, 이미지 배경이 있으면 건물을 추가로 그리지 않음
  if (bgStage2UpperLoaded && bgStage2MidLoaded && bgStage2LowerLoaded) {
    return;
  }

  push();
  noStroke();

  for (let b of worldBuildings) {
    if (b.y < cameraY - 550 || b.y - b.h > cameraY + 800 + 300) {
      continue;
    }

    let c1 = lerpColor(color('#1c233b'), color('#0c101f'), b.shade);
    fill(c1);
    rect(b.x, b.y - b.h, b.w, b.h + 30);

    fill(255, 224, 135, b.lit ? 150 : 45);
    let cols = max(1, floor(b.w / 18));
    let rows = max(2, floor(b.h / 30));
    for (let cx = 0; cx < cols; cx++) {
      for (let ry = 0; ry < rows; ry++) {
        if (noise(b.x * 0.03, cx * 5, ry * 2) > 0.50) {
          rect(b.x + 9 + cx * 17, b.y - b.h + 18 + ry * 28, 6, 9, 1);
        }
      }
    }

    fill(12, 16, 32, 140);
    rect(b.x, b.y - 4, b.w, 12);
  }

  pop();
}

function drawGround() {
  if (cameraY < STAGE2_EARTH_Y - 800 - 100) {
    return;
  }

  push();
  noStroke();

  fill(19, 24, 35);
  rect(0, STAGE2_EARTH_Y, 600, 500);

  fill(25, 45, 44);
  rect(0, STAGE2_EARTH_Y - 8, 600, 18);

  stroke(44, 74, 58);
  strokeWeight(2);
  for (let x = 0; x < 600; x += 9) {
    let h = 8 + noise(x * 0.03) * 10;
    line(x, STAGE2_EARTH_Y, x - 2, STAGE2_EARTH_Y - h);
  }

  noStroke();
  fill(8, 10, 20);
  let bx = ownerX;
  let by = STAGE2_EARTH_Y - 4;
  rect(bx - 45, by - 20, 90, 8, 3);
  rect(bx - 43, by - 42, 86, 7, 3);
  rect(bx - 39, by - 38, 6, 40);
  rect(bx + 34, by - 38, 6, 40);
  rect(bx - 35, by - 20, 6, 25);
  rect(bx + 30, by - 20, 6, 25);

  pop();
}

function drawHeavenGate() {
  if (cameraY < STAGE1_GATE_Y - 900) return;

  push();
  translate(300, STAGE1_GATE_Y);
  let openReady = memoryCollected >= MEMORY_TARGET;
  let pulse = sin(frameCount * 0.06) * 0.5 + 0.5;

  drawingContext.shadowBlur = openReady ? 28 + pulse * 18 : 10;
  drawingContext.shadowColor = openReady ? color(255, 232, 130, 230) : color(130, 170, 220, 130);

  noStroke();
  fill(openReady ? color(255, 238, 150, 75 + pulse * 45) : color(120, 155, 215, 45));
  rect(-92, -108, 184, 236, 10);
  rect(-116, -72, 232, 194, 12);

  drawHeavenGateCloudBarrier(openReady, pulse);
  drawPixelGateBase(openReady, pulse);
  drawPixelGateArch(openReady, pulse);
  drawPixelGateLight(openReady, pulse);

  noStroke();
  textAlign(CENTER, CENTER);
  textFont('serif');
  textSize(18);
  fill(255, 246, 220, openReady ? 245 : 155);
  text(openReady ? '지상으로 가는 문' : '기억이 부족해 아직 열리지 않는다', 0, 178);

  drawingContext.shadowBlur = 0;
  pop();
}

function drawHeavenGateCloudBarrier(openReady, pulse) {
  push();
  translate(0, 228);

  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = color(210, 235, 255, 165);
  noStroke();

  // 지상문 아래의 구름다리
  fill(255, 255, 255, openReady ? 225 : 238);
  ellipse(-130, 26, 180, 46);
  ellipse(-30, 14, 180, 54);
  ellipse(90, 18, 210, 58);
  ellipse(210, 30, 150, 42);

  fill(222, 238, 255, openReady ? 140 : 175);
  ellipse(-118, 40, 155, 18);
  ellipse(18, 34, 220, 22);
  ellipse(182, 42, 146, 16);

  fill(255,255,255,120);
  ellipse(-52, 7, 74, 10);
  ellipse(110, 10, 90, 12);

  drawingContext.shadowBlur = 0;
  pop();
}

function drawPixelGateBase(openReady, pulse) {
  let gold = openReady ? color(255, 225, 116, 235) : color(150, 170, 205, 165);
  let bright = openReady ? color(255, 248, 205, 245) : color(195, 215, 235, 170);
  let shadow = openReady ? color(170, 118, 58, 200) : color(75, 95, 135, 170);

  noStroke();
  fill(255, 255, 255, openReady ? 218 : 145);
  rect(-108, 124, 70, 18, 8);
  rect(-72, 112, 88, 22, 8);
  rect(-12, 122, 108, 24, 8);
  rect(58, 112, 72, 22, 8);
  fill(210, 235, 255, openReady ? 128 : 85);
  rect(-82, 138, 164, 12, 6);

  fill(shadow);
  rect(-88, -8, 24, 130, 3);
  rect(64, -8, 24, 130, 3);
  fill(gold);
  rect(-84, -8, 18, 130, 3);
  rect(66, -8, 18, 130, 3);
  fill(bright);
  rect(-80, -4, 6, 122, 2);
  rect(70, -4, 6, 122, 2);

  fill(gold);
  rect(-98, -28, 52, 18, 4);
  rect(46, -28, 52, 18, 4);
  rect(-98, 116, 52, 20, 4);
  rect(46, 116, 52, 20, 4);
  fill(bright);
  rect(-90, -24, 36, 5, 2);
  rect(54, -24, 36, 5, 2);
}

function drawPixelGateArch(openReady, pulse) {
  let gold = openReady ? color(255, 225, 116, 240) : color(150, 170, 205, 175);
  let bright = openReady ? color(255, 250, 210, 250) : color(195, 215, 235, 180);
  let shadow = openReady ? color(155, 100, 52, 190) : color(70, 90, 135, 155);
  let rows = [[-48,-82,96],[-64,-68,128],[-76,-52,152],[-82,-36,164],[-86,-20,172]];
  fill(shadow);
  for (let r of rows) rect(r[0]-4, r[1]+4, r[2]+8, 16, 5);
  fill(gold);
  for (let r of rows) rect(r[0], r[1], r[2], 14, 5);
  fill(bright);
  for (let r of rows) rect(r[0]+8, r[1]+3, r[2]-16, 3, 2);
}

function drawPixelGateLight(openReady, pulse) {
  fill(openReady ? color(32, 62, 110, 110 + pulse * 65) : color(20, 30, 60, 150));
  rect(-58, -34, 116, 154, 10);
  rect(-46, -54, 92, 22, 8);
  rect(-34, -70, 68, 18, 8);
  rect(-18, -82, 36, 15, 8);

  if (openReady) {
    fill(105, 210, 255, 170 + pulse * 70);
    rect(-18, 12, 36, 36, 6);
    rect(-9, 3, 18, 54, 5);
    fill(255, 245, 165, 210 + pulse * 35);
    drawTinyStar(0, -91, 15 + pulse * 2);
    drawTinyStar(-72, 28, 8);
    drawTinyStar(76, 34, 7);
    drawTinyStar(-38, -4, 5);
    drawTinyStar(42, -6, 5);
  } else {
    fill(160, 185, 225, 110);
    rect(-10, 18, 20, 28, 4);
  }
}

function drawTinyStar(x, y, r) {
  beginShape();
  for (let i = 0; i < 8; i++) {
    let a = -HALF_PI + i * PI / 4;
    let rr = i % 2 === 0 ? r : r * 0.42;
    vertex(x + cos(a) * rr, y + sin(a) * rr);
  }
  endShape(CLOSE);
}

function drawTinyStar(x, y, r) {
  beginShape();
  for (let i = 0; i < 8; i++) {
    let a = -HALF_PI + i * PI / 4;
    let rr = i % 2 === 0 ? r : r * 0.42;
    vertex(x + cos(a) * rr, y + sin(a) * rr);
  }
  endShape(CLOSE);
}


function drawEndingPark() {
  push();
  noStroke();

  fill(37, 43, 67, 165);
  for (let b of cityBackdrop) {
    let by = 800 - 130 - b.h * 0.75;
    rect(b.x, by, b.w, 800 - by);
    if (b.lit) {
      fill(255, 219, 130, 130);
      for (let x = b.x + 10; x < b.x + b.w - 6; x += 17) {
        for (let y = by + 15; y < 800 - 145; y += 25) {
          if (noise(x * 0.2, y * 0.2) > 0.50) {
            rect(x, y, 5, 8, 1);
          }
        }
      }
      fill(37, 43, 67, 165);
    }
  }

  fill(23, 22, 35);
  rect(0, 800 - 125, 600, 125);

  fill(33, 55, 48);
  rect(0, 800 - 132, 600, 15);

  stroke(46, 78, 60);
  for (let x = 0; x < 600; x += 8) {
    line(x, 800 - 125, x + random(-2, 2), 800 - 135 - noise(x) * 8);
  }

  noStroke();
  fill(9, 10, 20);
  let bx = ownerX;
  let by = 800 - 125;
  rect(bx - 50, by - 18, 100, 8, 3);
  rect(bx - 48, by - 44, 96, 7, 3);
  rect(bx - 42, by - 40, 6, 43);
  rect(bx + 36, by - 40, 6, 43);
  rect(bx - 38, by - 18, 6, 28);
  rect(bx + 32, by - 18, 6, 28);

  pop();
}

function drawOwner(x, groundY, mood, timer) {
  push();
  translate(x, groundY);

  if (drawOwnerSprite(mood)) {
    pop();
    return true;
  }

  noStroke();

  let bodyC = color(18, 18, 30);
  let hairC = color(13, 12, 21);
  let skinC = color(238, 202, 181);
  let tearC = color(155, 220, 255);

  // legs
  fill(15, 15, 27);
  rect(-18, -22, 10, 35, 4);
  rect(2, -22, 10, 35, 4);

  // body
  fill(bodyC);
  ellipse(-5, -48, 34, 48);

  // neck/head
  fill(skinC);
  ellipse(-5, -86, 28, 31);

  // hair
  fill(hairC);
  arc(-5, -91, 34, 33, PI, TWO_PI);
  ellipse(-15, -84, 13, 25);
  ellipse(4, -87, 20, 18);

  // face details
  if (mood === 'sad') {
    stroke(45, 35, 35);
    strokeWeight(2);
    line(-13, -87, -8, -86);
    line(2, -86, 7, -87);
    noStroke();
    fill(tearC, 190 + sin(frameCount * 0.1) * 40);
    ellipse(8, -80 + (timer % 55) * 0.25, 4, 7);
    ellipse(-10, -78 + ((timer + 20) % 55) * 0.25, 3, 6);
  } else if (mood === 'hug') {
    stroke(45, 35, 35);
    strokeWeight(2);
    arc(-7, -84, 8, 5, 0, PI);
    arc(6, -84, 8, 5, 0, PI);
    noFill();
    arc(-1, -76, 14, 9, 0, PI);
    noStroke();
    fill(tearC, 180);
    ellipse(11, -78 + sin(frameCount * 0.12) * 2, 4, 7);
  } else {
    stroke(45, 35, 35);
    strokeWeight(2);
    arc(-8, -86, 8, 5, PI, TWO_PI);
    arc(6, -86, 8, 5, PI, TWO_PI);
    noStroke();
  }

  // arms
  noStroke();
  fill(skinC);
  if (mood === 'hug') {
    push();
    translate(-15, -59);
    rotate(-0.7);
    rect(-2, 0, 9, 42, 5);
    pop();

    push();
    translate(6, -61);
    rotate(0.65);
    rect(-2, 0, 9, 42, 5);
    pop();
  } else if (mood === 'reach' || mood === 'lookUp') {
    push();
    translate(-18, -58);
    rotate(-1.0);
    rect(-2, 0, 8, 48, 5);
    pop();

    push();
    translate(8, -60);
    rotate(0.35);
    rect(-2, 0, 8, 35, 5);
    pop();
  } else {
    rect(-25, -62, 9, 35, 5);
    rect(12, -62, 9, 35, 5);
  }

  pop();
  return false;
}

function drawOwnerSprite(mood) {
  let key = mood;
  if (mood === 'lookUp') key = 'lookup';

  if (!ownerSheetLoaded || !ownerSheet || !OWNER_FRAMES[key]) {
    return false;
  }

  let frame = OWNER_FRAMES[key];
  let displayH = 150;

  if (key === 'lookup' || key === 'stand' || key === 'walk1') {
    displayH = 164;
  } else if (key === 'sad' || key === 'cry' || key === 'tearsmile') {
    displayH = 132;
  } else if (key === 'reach') {
    displayH = 138;
  } else if (key === 'hug' || key === 'lap') {
    displayH = 148;
  }

  // 스프라이트 시트의 한 칸은 투명 여백을 포함하므로, 실제 그림 크기가 기존 크기로 보이도록 보정합니다.
  let drawH = displayH * OWNER_CELL_H / frame.h;
  let drawW = drawH * OWNER_CELL_W / OWNER_CELL_H;

  push();
  imageMode(CENTER);
  tint(255, 255);
  // owner_sheet.png는 발이 셀 아래쪽에 맞춰져 있으므로, 셀의 아래가 groundY에 닿도록 그립니다.
  drawAtlasFrame(ownerSheet, frame, OWNER_CELL_W, OWNER_CELL_H, OWNER_COLS, 0, -drawH / 2, drawW, drawH);
  noTint();
  pop();
  return true;
}

function drawEndingText(txt, y, timer, delay) {
  let a = constrain((timer - delay) * 4, 0, 255);
  push();
  rectMode(CENTER);
  fill(10, 13, 28, a * 0.58);
  stroke(255, 255, 255, a * 0.15);
  rect(600 / 2, y, 500, 76, 14);

  noStroke();
  fill(255, 244, 220, a);
  textAlign(CENTER, CENTER);
  textFont('serif');
  textSize(20);
  text(txt, 600 / 2, y);
  pop();
}

// ==============================
// HUD / OVERLAYS
// ==============================


function drawHUD() {
  push();

  translate(30, 32);
  for (let i = 0; i < 3; i++) {
    if (i < player.hearts) {
      fill(238, 82, 98);
      stroke(255, 255, 255, 90);
      strokeWeight(1);
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = color(238, 82, 98, 140);
      drawHeartShape(i * 30, 0, 15);
    } else {
      fill(35, 38, 50, 150);
      stroke(160, 165, 180, 110);
      strokeWeight(1.5);
      drawingContext.shadowBlur = 0;
      drawHeartShape(i * 30, 0, 15);
    }
  }
  drawingContext.shadowBlur = 0;
  pop();

  push();
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont('sans-serif');

  textSize(17);
  text(stage === 1 ? 'STAGE 1  천국에서 기억을 찾아서' : 'STAGE 2  지상으로 내려가는 길', 600 / 2, 28);

  fill(210, 225, 255, 185);
  textSize(12);
  let remainText;
  if (stage === 1) {
    let gateRemain = max(0, floor(STAGE1_GATE_Y - player.y));
    remainText = '기억조각 ' + memoryCollected + ' / ' + MEMORY_TARGET + '   ·   문까지 ' + gateRemain + 'm';
  } else {
    let remain = max(0, floor(map(player.y, 100, STAGE2_EARTH_Y, 1000, 0)));
    remainText = '지상까지 ' + remain.toLocaleString() + 'm';
  }
  text(remainText, 600 / 2, 50);
  pop();

  if (stage === 1) {
    drawMemoryBar();
  } else {
    drawStage2GoalBar();
  }
}


function drawMemoryBar() {
  push();

  let barX = 600 - 190;
  let barY = 27;
  let barW = 145;
  let barH = 14;

  textAlign(RIGHT, CENTER);
  textFont('sans-serif');
  textSize(12);
  fill(225, 235, 255, 210);
  text('기억', barX - 10, barY + barH / 2);

  rectMode(CORNER);
  fill(12, 18, 38, 155);
  stroke(255, 255, 255, 25);
  rect(barX, barY, barW, barH, 8);

  let progress = memoryCollected / MEMORY_TARGET;
  if (progress > 0) {
    noStroke();
    let c = lerpColor(color(100, 225, 255), color(255, 219, 75), progress);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = c;
    fill(c);
    rect(barX, barY, barW * progress, barH, 8);
  }

  drawingContext.shadowBlur = 0;
  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(11);
  text(floor(progress * 100) + '%', barX + barW + 8, barY + barH / 2);

  pop();
}

function drawStage2GoalBar() {
  push();

  let barX = 600 - 195;
  let barY = 27;
  let barW = 150;
  let barH = 14;
  let progress = constrain(map(player.y, 100, STAGE2_EARTH_Y, 0, 1), 0, 1);

  textAlign(RIGHT, CENTER);
  textFont('sans-serif');
  textSize(12);
  fill(225, 235, 255, 210);
  text('지상', barX - 10, barY + barH / 2);

  fill(12, 18, 38, 155);
  stroke(255, 255, 255, 25);
  rect(barX, barY, barW, barH, 8);

  noStroke();
  let c = lerpColor(color(150, 205, 255), color(255, 195, 120), progress);
  drawingContext.shadowBlur = 9;
  drawingContext.shadowColor = c;
  fill(c);
  rect(barX, barY, barW * progress, barH, 8);

  drawingContext.shadowBlur = 0;
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(11);
  text(floor(progress * 100) + '%', barX + barW + 8, barY + barH / 2);

  pop();
}



function drawInGameGuideOverlay() {
  if (guideOverlayTimer <= 0 || !player) {
    return;
  }

  guideOverlayTimer--;

  let a = guideOverlayTimer < 45 ? map(guideOverlayTimer, 0, 45, 0, 218) : 218;

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  // 실제 게임 배경 위에 살짝 투명하게 뜨는 설명서
  noStroke();
  fill(255, 250, 235, a);
  rect(300, 378, 520, 470, 28);

  stroke(255, 255, 255, a * 0.65);
  strokeWeight(2);
  noFill();
  rect(300, 378, 500, 450, 24);

  noStroke();
  fill(68, 56, 86, a);
  textSize(24);
  text(stage === 1 ? '천국 스테이지 설명서' : '지상 스테이지 설명서', 300, 177);

  fill(94, 82, 110, a * 0.85);
  textSize(12);
  text('잠시 후 사라집니다 · ENTER를 누르면 바로 닫기', 300, 204);

  if (stage === 1) {
    drawGuideInfoCard(190, 318, 210, 205, '먹어야 하는 것', 'star', [
      '기억조각 / 별조각',
      '18개 모으면',
      '지상문 조건 달성'
    ], a);

    drawGuideInfoCard(410, 318, 210, 205, '피해야 하는 것', 'danger', [
      '먹구름: 위로 튕김',
      '깃털: 하트 -1',
      '검은비: 느려짐',
      '그림자: 밀림'
    ], a);

    drawGuideClearBox(300, 516, [
      '① 기억조각 18개 모으기',
      '② 아래로 내려가기',
      '③ 지상문 통과하기'
    ], '기억조각이 부족한 채 문에 닿으면 다른 엔딩으로 이어집니다.', a);
  } else {
    drawGuideInfoCard(190, 318, 210, 205, '밟을 발판', 'platform', [
      '구름 / 새 / 비둘기',
      '건물 구간부터',
      '간판 발판 등장'
    ], a);

    drawGuideInfoCard(410, 318, 210, 205, '장애물 피해', 'danger', [
      '캔: 하트 -1 + 느려짐',
      '병: 하트 -2',
      '전선: 옆으로 밀림',
      '봉지: 위로 튕김'
    ], a);

    drawGuideClearBox(300, 516, [
      '① 양옆 발판 이용',
      '② 장애물 피하기',
      '③ 지상까지 내려가기'
    ], '비행기는 초반에만 나오며 밟으면 위로 튕겨 시간이 늦어집니다.', a);
  }

  drawGuideControlLine(300, 607, a);

  pop();
}

function drawGuideInfoCard(x, y, w, h, title, iconType, lines, a) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  fill(255, 255, 252, a * 0.82);
  stroke(95, 84, 115, a * 0.20);
  strokeWeight(1.5);
  rect(x, y, w, h, 20);

  noStroke();
  fill(68, 56, 86, a);
  textSize(17);
  text(title, x, y - 75);

  if (iconType === 'star') drawGuideStarIcon(x, y - 26, a);
  else if (iconType === 'platform') drawGuidePlatformIcon(x, y - 26, a);
  else drawGuideDangerIcons(x, y - 28, a);

  fill(78, 66, 95, a * 0.92);
  textSize(11);
  textLeading(17);
  text(lines.join('\n'), x, y + 55);

  pop();
}

function drawGuideClearBox(x, y, lines, note, a) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  fill(255, 255, 252, a * 0.72);
  stroke(95, 84, 115, a * 0.18);
  strokeWeight(1.5);
  rect(x, y, 435, 100, 18);

  fill(70, 58, 88, a);
  textSize(14);
  text(lines.join('   '), x, y - 18);

  fill(112, 100, 125, a * 0.90);
  textSize(11);
  text(note, x, y + 24, 390, 36);

  pop();
}

function drawGuideControlLine(x, y, a) {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans KR, Pretendard, sans-serif');

  fill(64, 54, 82, a * 0.88);
  noStroke();
  rect(x, y, 445, 42, 16);

  fill(255, 246, 230, a);
  textSize(12);
  text('마우스 포인터 따라가기  ·  A/D 또는 ←/→ 이동  ·  발판 착지 시 자동 점프', x, y);

  pop();
}

function drawGuideStarIcon(x, y, a) {
  push();
  translate(x, y);
  noStroke();
  drawingContext.shadowBlur = 14;
  drawingContext.shadowColor = color(255, 220, 70, a);
  fill(255, 223, 65, a);
  beginShape();
  vertex(0, -24);
  vertex(7, -7);
  vertex(24, 0);
  vertex(7, 7);
  vertex(0, 24);
  vertex(-7, 7);
  vertex(-24, 0);
  vertex(-7, -7);
  endShape(CLOSE);
  fill(90, 205, 235, a);
  ellipse(0, 0, 8, 8);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawGuidePlatformIcon(x, y, a) {
  push();
  translate(x, y);
  noStroke();
  fill(255, 255, 255, a);
  ellipse(-22, 5, 32, 20);
  ellipse(0, 0, 40, 26);
  ellipse(25, 6, 30, 18);
  fill(225, 238, 255, a * 0.75);
  ellipse(0, 9, 58, 16);
  fill(180, 190, 205, a);
  ellipse(0, 40, 36, 14);
  triangle(-22, 38, -50, 20, -10, 45);
  triangle(22, 38, 50, 20, 10, 45);
  pop();
}

function drawGuideDangerIcons(x, y, a) {
  push();
  translate(x, y);
  noStroke();

  fill(18, 20, 30, a);
  ellipse(-46, 6, 30, 20);
  ellipse(-28, 0, 28, 28);
  ellipse(-9, 8, 24, 17);
  fill(60, 68, 88, a * 0.8);
  ellipse(-28, -7, 10, 4);

  stroke(20, 22, 30, a);
  strokeWeight(5);
  line(22, -28, 22, 20);
  line(22, 20, 38, 20);

  strokeWeight(3);
  line(62, -14, 94, 14);
  line(94, -14, 62, 14);

  pop();
}


function drawMemoryTextOverlay() {
  if (memoryTextTimer <= 0) {
    return;
  }

  memoryTextTimer--;

  let a = 255;
  if (memoryTextTimer > 155) {
    a = map(memoryTextTimer, 180, 155, 0, 255);
  } else if (memoryTextTimer < 35) {
    a = map(memoryTextTimer, 35, 0, 255, 0);
  }

  push();
  rectMode(CENTER);
  fill(8, 12, 28, a * 0.72);
  stroke(255, 230, 130, a * 0.35);
  strokeWeight(1);
  rect(600 / 2, 800 - 116, 500, 64, 12);

  noStroke();
  fill(255, 248, 220, a);
  textAlign(CENTER, CENTER);
  textFont('serif');
  textSize(20);
  text(activeMemoryText, 600 / 2, 800 - 116);
  pop();
}


function drawStageClearOverlay() {
  if (stage !== 1) {
    return;
  }

  if (memoryCollected >= MEMORY_TARGET && stageClearCountdown <= 0 && player.y < STAGE1_GATE_Y - 120) {
    push();
    let a = 160 + sin(frameCount * 0.08) * 45;
    rectMode(CENTER);
    noStroke();
    fill(8, 12, 30, 120);
    rect(600 / 2, 104, 470, 46, 12);
    fill(255, 242, 180, a);
    textAlign(CENTER, CENTER);
    textFont('serif');
    textSize(18);
    text('기억은 모두 모았다. 이제 더 아래의 문까지 내려가자.', 600 / 2, 104);
    pop();
    return;
  }

  if (stageClearCountdown <= 0) {
    return;
  }

  let a = map(stageClearCountdown, 145, 0, 0, 230);
  a = constrain(230 - a, 0, 230);

  push();
  noStroke();
  fill(255, 250, 210, a * 0.16);
  rect(0, 0, 600, 800);

  fill(255, 242, 160, min(255, a + 40));
  textAlign(CENTER, CENTER);
  textFont('serif');
  textSize(30);
  text('천국문이 열렸다', 600 / 2, 170);
  pop();
}


function drawOffscreenWarning() {
  if (player.y < cameraY - 125) {
    warningTimer++;
    offscreenHighTimer++;

    if (connectionBreakTimer < 65) {
      connectionBreakTimer = 65;
      connectionBreakPower = max(connectionBreakPower, 0.65);
      connectionBreakText = '너무 높이 올라갔어';
    }

    push();
    noStroke();
    fill(255, 245, 230, 175);
    let arrowX = constrain(player.x, 24, 576);
    triangle(arrowX, 112, arrowX - 8, 100, arrowX + 8, 100);
    pop();

    // 이제 너무 높이 올라가도 엔딩으로 보내지 않고 카메라가 따라감
    if (warningTimer > 125) {
      player.vy += 0.06;
    }
  } else {
    warningTimer = 0;
    offscreenHighTimer = 0;
  }
}

function drawHeartShape(x, y, size) {
  beginShape();
  vertex(x, y - size / 4);
  bezierVertex(x - size / 2, y - size, x - size, y - size / 3, x, y + size / 2);
  bezierVertex(x + size, y - size / 3, x + size / 2, y - size, x, y - size / 4);
  endShape(CLOSE);
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

// ==============================
// CAT DRAWING
// ==============================

function chooseCatSprite(memory, vx, vy, walkCycle, isHurt) {
  let pose = 'idle';

  if (isHurt) {
    pose = 'hurt';
  } else if (memory < 0.18) {
    pose = 'spirit';
  } else if (vy < -2.2) {
    pose = 'jump';
  } else if (vy > 3.0) {
    pose = 'fall';
  } else if (abs(vx) > 0.45 && abs(vy) < 5.5) {
    let frames = ['walk1', 'walk2', 'walk3'];
    pose = frames[floor(walkCycle * 1.2) % frames.length];
  } else if (memory < 0.35) {
    pose = 'sleepy';
  }

  if (!CAT_FRAMES[pose]) {
    pose = 'idle';
  }
  return pose;
}

function getCatSpriteWidth(pose) {
  if (pose === 'spirit') return 98;
  if (pose === 'jump') return 92;
  if (pose === 'walk1' || pose === 'walk2' || pose === 'walk3') return 90;
  if (pose === 'fall') return 78;
  if (pose === 'hurt') return 76;
  if (pose === 'happy' || pose === 'sad' || pose === 'sleepy') return 76;
  return 78;
}

function drawCatVisual(x, y, sc, facing, memory, alphaOverride, vx, vy, walkCycle, isHurt) {
  push();
  translate(x, y);
  translate(0, sin(frameCount * 0.08) * 2.5);
  rotate(vx * 0.025);
  scale(facing * sc, sc);

  let alphaVal = alphaOverride;
  if (alphaVal === undefined || alphaVal === null) {
    alphaVal = map(memory, 0, 1, 65, 255);
  }

  if (isHurt && floor(frameCount / 4) % 2 === 0) {
    alphaVal = 35;
  }

  let glowColor = lerpColor(
  color(120, 225, 255),
  color(255, 225, 160),
  memory
);

drawingContext.shadowBlur =
  22 + sin(frameCount * 0.08) * 4;

drawingContext.shadowColor = color(
  red(glowColor),
  green(glowColor),
  blue(glowColor),
  180
);

  // cat_sheet.png가 있으면 사진에서 잘라낸 고양이 스프라이트를 사용합니다.
  if (catSheetLoaded && catSheet) {
    let pose = chooseCatSprite(memory, vx, vy, walkCycle, isHurt);
    let frame = CAT_FRAMES[pose] || CAT_FRAMES.idle;
    let visibleW = getCatSpriteWidth(pose);

    // 스프라이트 시트의 한 칸은 투명 여백을 포함하므로, 실제 그림 크기가 기존 크기로 보이도록 보정합니다.
    let drawW = visibleW * CAT_CELL_W / frame.w;
    let drawH = drawW * CAT_CELL_H / CAT_CELL_W;

    tint(255, 255, 255, alphaVal);
    drawAtlasFrame(catSheet, frame, CAT_CELL_W, CAT_CELL_H, CAT_COLS, 0, 0, drawW, drawH);

    noTint();
    pop();
    return;
  }

  drawVectorCat(memory, alphaVal, vx, vy, walkCycle);
  pop();
}


function drawVectorCat(memory, alphaVal, vx, vy, walkCycle) {
  // 게임 속 기본 고양이: 사용자가 정한 설정에 맞춰 단순한 도트풍 크림색 고양이로 수정.
  // 큰 타원형 눈, 작은 검은 삼각 코, 입 없음, 이마 세 줄 무늬, 갈색 꼬리 끝, 파란 방울.
  let ghostC = color(150, 225, 255);
  let furC = color(238, 211, 170);
  let creamC = color(255, 241, 205);
  let darkC = color(69, 45, 31);
  let stripeC = color(118, 74, 44);
  let bellBlue = color(70, 170, 255);
  let base = lerpColor(ghostC, furC, memory);
  let baseAlpha = alphaVal;

  noStroke();

  // 부드러운 영혼 빛
  if (memory < 0.95) {
    fill(120, 220, 255, baseAlpha * (0.16 + (1 - memory) * 0.20));
    ellipse(0, -8, 105, 118);
  }

  // 꼬리
  push();
  translate(35, 12);
  rotate(-0.52 + sin(frameCount * 0.08) * 0.13 - vy * 0.018);
  noFill();
  stroke(red(base), green(base), blue(base), baseAlpha);
  strokeWeight(15);
  strokeCap(ROUND);
  bezier(0, 18, 23, -18, 38, -44, 65, -60);
  stroke(red(darkC), green(darkC), blue(darkC), baseAlpha * max(0.45, memory));
  strokeWeight(16);
  bezier(62, -60, 78, -70, 88, -58, 91, -46);
  stroke(red(stripeC), green(stripeC), blue(stripeC), baseAlpha * memory);
  strokeWeight(4);
  line(58, -55, 70, -64);
  line(70, -60, 84, -52);
  pop();

  // 몸통
  fill(red(base), green(base), blue(base), baseAlpha);
  ellipse(0, 13, 76, 70);
  fill(red(creamC), green(creamC), blue(creamC), baseAlpha * max(0.35, memory));
  ellipse(-2, 23, 38, 48);

  // 머리와 귀
  fill(red(base), green(base), blue(base), baseAlpha);
  ellipse(-2, -36, 76, 62);
  triangle(-37, -50, -30, -82, -9, -58);
  triangle(22, -58, 39, -82, 42, -48);

  fill(224, 176, 150, baseAlpha * max(0.18, memory));
  triangle(-30, -54, -27, -70, -17, -58);
  triangle(28, -58, 36, -70, 37, -52);

  // 이마 세 줄 무늬
  stroke(red(stripeC), green(stripeC), blue(stripeC), baseAlpha * max(0.25, memory));
  strokeWeight(4);
  strokeCap(ROUND);
  line(-15, -66, -12, -49);
  line(0, -68, -1, -49);
  line(15, -65, 11, -49);

  // 볼/몸통 줄무늬
  strokeWeight(3);
  line(-43, -32, -28, -29);
  line(-43, -21, -29, -22);
  line(29, -31, 45, -34);
  line(30, -21, 47, -20);
  line(-42, 12, -29, 10);
  line(31, 10, 45, 8);

  // 발
  noStroke();
  let stepA = sin(walkCycle) * 3;
  fill(red(base), green(base), blue(base), baseAlpha);
  ellipse(-27, 48 + stepA, 16, 21);
  ellipse(-9, 51 - stepA, 15, 20);
  ellipse(11, 51 + stepA, 15, 20);
  ellipse(29, 48 - stepA, 16, 21);

  // 큰 타원형 눈
  fill(255, 250, 230, baseAlpha * max(0.35, memory));
  ellipse(-18, -38, 17, 20);
  ellipse(18, -38, 17, 20);
  fill(red(darkC), green(darkC), blue(darkC), baseAlpha);
  ellipse(-17, -36, 7, 11);
  ellipse(17, -36, 7, 11);
  fill(255, 255, 255, baseAlpha * 0.85);
  ellipse(-19, -40, 3, 4);
  ellipse(15, -40, 3, 4);

  // 작은 검은 삼각 코, 입은 그리지 않음
  noStroke();
  fill(red(darkC), green(darkC), blue(darkC), baseAlpha);
  triangle(-4, -25, 5, -25, 0, -19);

  // 수염
  stroke(red(darkC), green(darkC), blue(darkC), baseAlpha * 0.78);
  strokeWeight(2);
  line(-27, -24, -56, -30);
  line(-28, -17, -58, -17);
  line(-27, -10, -54, -5);
  line(27, -24, 56, -30);
  line(28, -17, 58, -17);
  line(27, -10, 54, -5);

  // 파란 방울 목걸이: 기억이 돌아올수록 선명, 지상에서는 항상 선명.
  let bellAlpha = baseAlpha * (stage === 2 ? 1 : constrain(map(memory, 0.35, 1, 0, 1), 0, 1));
  if (bellAlpha > 8) {
    stroke(55, 65, 95, bellAlpha);
    strokeWeight(5);
    line(-35, 0, 36, 0);

    noStroke();
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = color(70, 170, 255, bellAlpha);
    fill(red(bellBlue), green(bellBlue), blue(bellBlue), bellAlpha);
    ellipse(2, 9, 20, 19);
    fill(200, 236, 255, bellAlpha * 0.78);
    rect(-4, 4, 12, 4, 2);
    fill(20, 75, 130, bellAlpha);
    rect(-2, 14, 8, 3, 1);
    drawingContext.shadowBlur = 0;
  }
}


// ==============================
// GAME ENTITIES
// ==============================



function getGameMousePosition() {
  let s = min(windowWidth / 600, windowHeight / 800);
  let ox = (windowWidth - 600 * s) / 2;
  let oy = (windowHeight - 800 * s) / 2;
  return {
    x: (mouseX - ox) / s,
    y: (mouseY - oy) / s
  };
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 15;

    this.gravity = 0.28;
    this.maxFallSpeed = 11.5;
    this.jumpStrength = -5.4;

    this.memory = stage === 2 ? 1.0 : 0.0;
    this.hearts = 3;
    this.slowTimer = 0;
    this.statusTextTimer = 0;

    this.jumpCharge = 0;
    this.isHurt = false;
    this.hurtTimer = 0;

    this.facing = 1;
    this.walkCycle = 0;
  }

  update() {
    if (this.isHurt) {
      this.hurtTimer--;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
    }

    this.vy += this.gravity;
    if (this.vy > this.maxFallSpeed) {
      this.vy = this.maxFallSpeed;
    }

    // 키보드 + 마우스 조작 둘 다 지원
    // 수정: 마우스를 실제로 움직인 적이 없으면 고양이가 임의로 왼쪽/오른쪽으로 끌려가지 않음
    let keyboardInput = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) keyboardInput -= 1;   // ← or A
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) keyboardInput += 1;  // → or D

    if (keyboardInput !== 0) {
      lastKeyboardControlFrame = frameCount;
    }

    let gm = getGameMousePosition();
    if (gm && gm.x >= 0 && gm.x <= 600 && gm.y >= 0 && gm.y <= 800) {
      if (lastMouseGameX === null || dist(gm.x, gm.y, lastMouseGameX, lastMouseGameY) > 2.2) {
        lastMouseControlFrame = frameCount;
        lastMouseGameX = gm.x;
        lastMouseGameY = gm.y;
      }
    }

    let input = keyboardInput;
    let useMouseFollow =
      keyboardInput === 0 &&
      frameCount - lastKeyboardControlFrame > 45 &&
      frameCount - lastMouseControlFrame < 150;

    if (useMouseFollow && gm && gm.x >= 0 && gm.x <= 600 && gm.y >= 0 && gm.y <= 800) {
      let diff = gm.x - this.x;
      if (abs(diff) > 10) {
        input = constrain(diff / 115, -1, 1);
      }
    }

    if (this.slowTimer > 0) {
      this.slowTimer--;
    }

    let speedFactor = this.slowTimer > 0 ? 0.55 : 1.0;
    let targetVx = input * 4.6 * speedFactor;
    let controlEase = keyboardInput !== 0 ? 0.34 : (input === 0 ? 0.18 : 0.14);
    this.vx = lerp(this.vx, targetVx, controlEase);
    this.vx = constrain(this.vx, -5.5, 5.5);

    // 아주 작은 부유감
    if (abs(input) > 0.05) {
      this.vy += sin(frameCount * 0.12) * 0.012;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx = 0;
    } else if (this.x > 600 - this.radius) {
      this.x = 600 - this.radius;
      this.vx = 0;
    }

    if (this.vx > 0.15) {
      this.facing = 1;
    } else if (this.vx < -0.15) {
      this.facing = -1;
    }

    if (abs(this.vx) > 0.25) {
      this.walkCycle += abs(this.vx) * 0.09;
    } else {
      this.walkCycle *= 0.8;
    }

    if (frameCount % 8 === 0) {
      particles.add(new Particle(this.x + random(-10, 10), this.y + random(-12, 12), 'sparkle'));
    }

    if (stage === 2 && this.y > STAGE2_EARTH_Y - this.radius) {
      this.y = STAGE2_EARTH_Y - this.radius;
      this.vy = 0;
    }
  }

  jump() {
    // 발판 자동 점프 게임이라 수동 점프는 거의 쓰지 않습니다.
    // 그래도 너무 답답할 때 SPACE로 아주 작은 낙하 제어만 가능하게 둡니다.
    if (this.vy > 2) {
      this.vy *= 0.78;
    }
  }

  checkPlatformCollision(platform) {
    if (this.vy < 0) {
      return false;
    }

    let feetY = this.y + this.radius;
    let prevFeetY = this.y - this.vy + this.radius;
    let pTop = platform.y;
    let pLeft = platform.x - platform.w / 2;
    let pRight = platform.x + platform.w / 2;

    if (prevFeetY <= pTop + 5 && feetY >= pTop - 5) {
      if (this.x + this.radius * 0.55 >= pLeft && this.x - this.radius * 0.55 <= pRight) {
        this.y = pTop - this.radius;
        let bounce = platform.getBouncePower ? platform.getBouncePower() : -5.4;
        this.vy = bounce;

        if (platform.type === 'storm') {
          registerBlackCloudBounce();
        } else if (platform.type === 'plane') {
          triggerConnectionBreak('너무 높이 솟구쳤어', 0.85);
        } else if (platform.type === 'cloudboost') {
          triggerConnectionBreak('위로 밀려났어', 0.65);
        } else if (platform.type === 'bird') {
          activeMemoryText = '작은 새가 잠깐 길을 이어 주었다.';
          memoryTextTimer = 90;
        }

        let particleType = platform.type === 'storm' ? 'storm' : 'cloud';
        let count = platform.type === 'storm' || platform.type === 'plane' || platform.type === 'cloudboost' ? 20 : 8;
        for (let i = 0; i < count; i++) {
          particles.add(new Particle(this.x + random(-24, 24), pTop, particleType));
        }
        return true;
      }
    }

    return false;
  }

  collectMemory() {
    if (stage !== 1 || memoryCollected >= MEMORY_TARGET) {
      return;
    }

    memoryCollected++;
    this.memory = constrain(memoryCollected / MEMORY_TARGET, 0, 1);

    let idx = constrain(memoryCollected - 1, 0, memoryTexts.length - 1);
    activeMemoryText = memoryTexts[idx];
    memoryTextTimer = memoryCollected >= MEMORY_TARGET ? 220 : 180;

    for (let i = 0; i < 26; i++) {
      particles.add(new Particle(this.x, this.y, 'burst'));
    }

    if (memoryCollected >= MEMORY_TARGET) {
      activeMemoryText = '기억은 모두 모았다. 이제 아래의 천국문을 찾아야 해.';
      memoryTextTimer = 210;
    }
  }


  takeDamage(obstacle) {
    if (this.isHurt) {
      return;
    }

    let effect = obstacle && obstacle.getEffect ? obstacle.getEffect() : {
      damage: 1,
      slow: 0,
      knockY: -3.8,
      knockX: 0,
      text: '장애물에 맞아 체력이 줄었어.'
    };

    this.hearts -= effect.damage;
    this.isHurt = true;
    this.hurtTimer = 70;
    this.slowTimer = max(this.slowTimer, effect.slow || 0);
    this.vy = effect.knockY === undefined ? -3.8 : effect.knockY;

    if (effect.knockX) {
      this.vx += (this.x < obstacle.x ? -1 : 1) * effect.knockX;
    }

    screenShake = 10 + effect.damage * 4;
    flashOverlayAlpha = 55 + effect.damage * 16;
    activeMemoryText = effect.text;
    memoryTextTimer = 160;

    for (let i = 0; i < 16 + effect.damage * 8; i++) {
      particles.add(new Particle(this.x, this.y, 'splash'));
    }

    if (this.hearts <= 0) {
      gameState = 'GAMEOVER';
      particles.clear();
    }
  }


  draw() {
    drawCatVisual(
      this.x,
      this.y,
      0.60,
      this.facing,
      this.memory,
      null,
      this.vx,
      this.vy,
      this.walkCycle,
      this.isHurt
    );
  }
}



class Platform {
  constructor(x, y, w, h, type) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.w = w;
    this.h = h;
    this.type = type || 'normal';

    this.driftSpeed = 0;
    this.wavePhase = random(TWO_PI);
    this.waveSpeed = random(0.014, 0.025);
    this.waveAmp = (this.type === 'plane' || this.type === 'pigeon' || this.type === 'bird' || this.type === 'cloudboost') ? random(18, 34) : random(8, 22);
    this.bobAmp = (this.type === 'plane' || this.type === 'pigeon' || this.type === 'bird' || this.type === 'cloudboost') ? random(3, 8) : random(2, 6);

    if (this.type === 'plane') {
      this.driftSpeed = random(-0.18, 0.18);
    } else if (this.type === 'pigeon' || this.type === 'bird') {
      this.driftSpeed = random(-0.12, 0.12);
    } else if (this.type === 'cloudboost') {
      this.driftSpeed = random(-0.10, 0.10);
    }

    this.signText = '';
    this.signStyle = null;
    this.verticalSign = false;
    this.attachSide = x < 300 ? 'left' : 'right';

    if (this.type === 'sign' || this.type === 'neon') {
      this.signText = random(SIGN_TEXTS);
      this.verticalSign = random() < 0.35 && this.signText.length >= 3;
      this.signStyle = this.type === 'neon' ? random(NEON_STYLES) : random(SIGN_STYLES);
      this.waveAmp = 0;
      this.bobAmp = 0;
      this.driftSpeed = 0;
    }

    this.puffs = [];
    let count = floor(w / 12) + 2;
    for (let i = 0; i < count; i++) {
      let px = map(i, 0, count - 1, -w / 2, w / 2);
      let py = random(-5, 5);
      let pr = random(h * 0.9, h * 1.55);
      this.puffs.push({ x: px, y: py, r: pr });
    }
  }

  getBouncePower() {
    if (this.type === 'storm') return -11.8;
    if (this.type === 'plane') return -14.6;
    if (this.type === 'pigeon') return -6.5;
    if (this.type === 'bird') return -6.2;
    if (this.type === 'cloudboost') return -10.8;
    if (this.type === 'sign' || this.type === 'neon') return -5.8;
    if (this.type === 'heaven') return -6.8;
    return -6.2;
  }

  update() {
    if (this.type === 'sign' || this.type === 'neon') {
      return;
    }

    let t = frameCount * this.waveSpeed + this.wavePhase;
    this.baseX += this.driftSpeed;

    if (this.baseX - this.w / 2 < 26) {
      this.baseX = 26 + this.w / 2;
      this.driftSpeed *= -1;
    } else if (this.baseX + this.w / 2 > 600 - 26) {
      this.baseX = 600 - 26 - this.w / 2;
      this.driftSpeed *= -1;
    }

    this.x = this.baseX + sin(t) * this.waveAmp;
    this.y = this.baseY + cos(t * 0.85) * this.bobAmp;
  }

  drawCloudLike(mainC, subC) {
    noStroke();

    // 사용자가 보내준 코드의 구름 방식 그대로:
    // 흰 원형 puff 여러 개 + 아래쪽 푸른 그림자 puff
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = color(255, 255, 255, 100);

    fill(255, 255, 255, 235);
    for (let p of this.puffs) {
      ellipse(p.x, p.y, p.r, p.r);
    }

    fill(230, 238, 255, 190);
    for (let p of this.puffs) {
      ellipse(p.x, p.y + 3, p.r * 0.8, p.r * 0.8);
    }
  }

  drawStormCloudLike() {
    noStroke();

    drawingContext.shadowBlur = 14;
    drawingContext.shadowColor = color(25, 28, 40, 190);

    fill(18, 20, 30, 245);
    for (let p of this.puffs) {
      ellipse(p.x, p.y, p.r, p.r);
    }

    fill(48, 54, 72, 220);
    for (let p of this.puffs) {
      ellipse(p.x, p.y - 2, p.r * 0.85, p.r * 0.85);
    }

    fill(95, 105, 130, 120);
    for (let p of this.puffs) {
      ellipse(p.x - p.r * 0.10, p.y - p.r * 0.18, p.r * 0.30, p.r * 0.18);
    }

    stroke(185, 205, 230, 150);
    strokeWeight(2);
    line(-this.w * 0.20, 5, -this.w * 0.10, 18);
    line(0, 6, 7, 20);
    line(this.w * 0.18, 5, this.w * 0.28, 18);
    noStroke();
  }

  drawCloudBoostLike() {
    noStroke();

    drawingContext.shadowBlur = 16;
    drawingContext.shadowColor = color(255, 235, 120, 170);

    fill(255, 255, 255, 235);
    for (let p of this.puffs) {
      ellipse(p.x, p.y, p.r, p.r);
    }

    fill(255, 237, 160, 210);
    for (let p of this.puffs) {
      ellipse(p.x, p.y - 2, p.r * 0.85, p.r * 0.85);
    }

    fill(255, 255, 220, 180);
    for (let i = 0; i < 4; i++) {
      let px = map(i, 0, 3, -this.w * 0.35, this.w * 0.35);
      ellipse(px, -this.h * 0.45 + sin(frameCount * 0.12 + i) * 2, 4, 4);
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    noStroke();

    if (this.type === 'storm') {
      this.drawStormCloudLike();
    } else if (this.type === 'heaven') {
      drawingContext.shadowBlur = 16;
      drawingContext.shadowColor = color(255, 235, 165, 140);
      fill(255, 246, 210, 235);
      rect(-this.w / 2, -7, this.w, 18, 8);
      fill(255, 224, 120, 175);
      rect(-this.w / 2 + 8, -2, this.w - 16, 6, 4);
      fill(255, 255, 255, 150);
      ellipse(-this.w * 0.24, -10, 28, 14);
      ellipse(this.w * 0.26, -10, 24, 12);
    } else if (this.type === 'plane') {
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = color(210, 230, 255, 150);
      fill(225, 236, 248, 245);
      rect(-this.w / 2, -8, this.w, 16, 8);
      triangle(-8, -8, 26, -36, 34, -8);
      triangle(-10, 8, 23, 31, 33, 8);
      triangle(this.w / 2 - 12, -7, this.w / 2 + 20, -21, this.w / 2 - 2, 4);
      fill(145, 170, 205, 230);
      rect(-this.w / 2 + 14, -3, 11, 6, 2);
      rect(-this.w / 2 + 34, -3, 11, 6, 2);
    } else if (this.type === 'pigeon' || this.type === 'bird') {
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = color(180, 195, 220, 120);

      if (this.type === 'bird') {
        // 작은 새 발판: 건물 구간 이후 비행기를 대체
        fill(205, 214, 224, 245);
        ellipse(0, 1, this.w * 0.34, 18);
        fill(178, 190, 208, 235);
        triangle(-6, 0, -this.w * 0.45, -28, -this.w * 0.14, 8);
        triangle(6, 0, this.w * 0.45, -28, this.w * 0.14, 8);
        fill(75, 84, 99, 230);
        ellipse(this.w * 0.18, -5, 14, 12);
        fill(255, 210, 85, 230);
        triangle(this.w * 0.25, -5, this.w * 0.38, -10, this.w * 0.31, 0);
      } else {
        fill(160, 170, 185, 240);
        ellipse(0, 0, this.w * 0.50, 20);
        triangle(-8, 0, -this.w / 2, -22, -this.w * 0.18, 8);
        triangle(8, 0, this.w / 2, -20, this.w * 0.18, 8);
        fill(70, 78, 92, 230);
        ellipse(this.w * 0.24, -5, 17, 14);
        fill(240, 200, 80, 230);
        triangle(this.w * 0.33, -5, this.w * 0.46, -10, this.w * 0.38, 0);
      }
    } else if (this.type === 'sign' || this.type === 'neon') {
      let palette = this.signStyle || (this.type === 'neon' ? NEON_STYLES[0] : SIGN_STYLES[0]);

      drawingContext.shadowBlur = this.type === 'neon' ? 16 : 8;
      drawingContext.shadowColor = color(palette.accent);

      // 간판이 공중에 떠 보이지 않게 뒤쪽에 건물 벽과 고정 브래킷을 같이 그림
      noStroke();
      fill(14, 20, 34, 232);
      if (this.attachSide === 'left') {
        rect(-this.w / 2 - 76, -58, 48, 116, 3);
        fill(38, 48, 70, 190);
        rect(-this.w / 2 - 64, -42, 12, 15, 2);
        rect(-this.w / 2 - 64, -15, 12, 15, 2);
        rect(-this.w / 2 - 64, 12, 12, 15, 2);
      } else {
        rect(this.w / 2 + 28, -58, 48, 116, 3);
        fill(38, 48, 70, 190);
        rect(this.w / 2 + 46, -42, 12, 15, 2);
        rect(this.w / 2 + 46, -15, 12, 15, 2);
        rect(this.w / 2 + 46, 12, 12, 15, 2);
      }

      stroke(76, 82, 97, 245);
      strokeWeight(5);
      if (this.attachSide === 'left') {
        line(-this.w / 2 - 28, -8, -this.w / 2, -8);
        line(-this.w / 2 - 28, -30, -this.w / 2 - 28, -8);
      } else {
        line(this.w / 2, -8, this.w / 2 + 28, -8);
        line(this.w / 2 + 28, -30, this.w / 2 + 28, -8);
      }

      noStroke();
      fill(palette.base);
      rect(-this.w / 2, -14, this.w, 28, 5);

      stroke(palette.border);
      strokeWeight(3);
      noFill();
      rect(-this.w / 2 + 4, -10, this.w - 8, 20, 4);

      noStroke();
      fill(255, 255, 255, this.type === 'neon' ? 36 : 24);
      rect(-this.w / 2 + 7, -11, this.w - 14, 6, 3);

      fill(palette.text);
      textAlign(CENTER, CENTER);
      textFont('sans-serif');

      if (this.verticalSign) {
        textSize(11);
        text(this.signText.split('').join('\n'), 0, 0);
      } else {
        textSize(this.signText.length >= 4 ? 10 : 12);
        text(this.signText, 0, 1);
      }

      if (this.type === 'neon') {
        fill(palette.accent);
        ellipse(this.attachSide === 'left' ? -this.w / 2 + 12 : this.w / 2 - 12, 0, 4, 4);
      }
    } else if (this.type === 'cloudboost') {
      this.drawCloudBoostLike();
    } else {
      this.drawCloudLike(color(255, 255, 255, 235), color(230, 238, 255, 190));
    }

    drawingContext.shadowBlur = 0;
    pop();
  }
}

class MemoryItem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 13;
    this.angle = random(TWO_PI);
    this.bobOffset = random(TWO_PI);
    this.collected = false;
  }

  update() {
    this.angle += 0.035;
  }

  draw() {
    let bob = sin(frameCount * 0.055 + this.bobOffset) * 6;
    let pulse = sin(frameCount * 0.08 + this.bobOffset) * 0.5 + 0.5;

    push();
    translate(this.x, this.y + bob);
    rotate(this.angle);

    noStroke();
    drawingContext.shadowBlur = 22 + pulse * 10;
    drawingContext.shadowColor = color(255, 230, 95, 230);

    // outer sparkle
    fill(255, 235, 120, 130);
    drawPixelStar(0, 0, this.r + 7);

    // crystal body
    fill(255, 214, 70, 245);
    drawPixelStar(0, 0, this.r + 2);

    fill(255, 247, 180, 240);
    drawPixelDiamond(0, 0, this.r * 0.9);

    fill(120, 220, 255, 205);
    rect(-3, -3, 6, 6, 1);

    // small orbit particles
    fill(255, 255, 230, 180);
    rect(-this.r - 9, -2, 4, 4);
    rect(this.r + 6, 1, 3, 3);
    rect(1, -this.r - 10, 4, 4);

    drawingContext.shadowBlur = 0;
    pop();
  }

  checkCollision(player) {
    let bob = sin(frameCount * 0.055 + this.bobOffset) * 6;
    let d = dist(player.x, player.y, this.x, this.y + bob);
    if (d < player.radius + this.r + 4) {
      this.collected = true;
      return true;
    }
    return false;
  }
}

function drawPixelStar(x, y, r) {
  beginShape();
  vertex(x, y - r);
  vertex(x + r * 0.28, y - r * 0.28);
  vertex(x + r, y);
  vertex(x + r * 0.28, y + r * 0.28);
  vertex(x, y + r);
  vertex(x - r * 0.28, y + r * 0.28);
  vertex(x - r, y);
  vertex(x - r * 0.28, y - r * 0.28);
  endShape(CLOSE);
}

function drawPixelDiamond(x, y, r) {
  beginShape();
  vertex(x, y - r);
  vertex(x + r * 0.62, y);
  vertex(x, y + r);
  vertex(x - r * 0.62, y);
  endShape(CLOSE);
}


class ObstacleItem {
  constructor(x, y, stageNum) {
    this.x = x;
    this.y = y;
    this.stageNum = stageNum;
    this.r = stageNum === 1 ? 11 : 12;
    this.bobOffset = random(TWO_PI);
    this.angle = random(TWO_PI);
    this.collected = false;
    this.type = stageNum === 1 ? random(['feather', 'shadow', 'rain']) : random(['can', 'bottle', 'wire', 'bag', 'gust']);
    this.drift = stageNum === 1 ? random(-0.16, 0.16) : random(-0.09, 0.09);
  }

  update() {
    this.angle += 0.025;
    this.x += this.drift;

    if (frameCount % 28 === 0 && random() < 0.28) {
      particles.add(new Particle(this.x, this.y, 'smoke'));
    }
  }

  getEffect() {
    if (this.stageNum === 1) {
      if (this.type === 'feather') {
        return { damage: 1, slow: 0, knockY: -6.2, knockX: 0, text: '검은 깃털: 하트 -1, 위로 튕김' };
      }
      if (this.type === 'rain') {
        return { damage: 1, slow: 125, knockY: -3.2, knockX: 0, text: '검은비: 하트 -1, 잠깐 느려짐' };
      }
      return { damage: 1, slow: 145, knockY: -3.8, knockX: 2.3, text: '그림자: 하트 -1, 느려짐과 밀림' };
    }

    if (this.type === 'can') {
      return { damage: 1, slow: 155, knockY: -3.4, knockX: 2.0, text: '캔: 하트 -1, 잠깐 느려짐' };
    }
    if (this.type === 'bottle') {
      return { damage: 2, slow: 0, knockY: -4.2, knockX: 2.7, text: '깨진 병: 하트 -2' };
    }
    if (this.type === 'wire') {
      return { damage: 1, slow: 95, knockY: -3.4, knockX: 4.0, text: '전선: 하트 -1, 옆으로 밀림' };
    }
    if (this.type === 'bag') {
      return { damage: 1, slow: 0, knockY: -7.2, knockX: 1.2, text: '비닐봉지: 하트 -1, 위로 튕김' };
    }
    return { damage: 0, slow: 100, knockY: -8.0, knockX: 0, text: '상승기류: 위로 밀림, 잠깐 느려짐' };
  }

  draw() {
    let bob = cos(frameCount * 0.045 + this.bobOffset) * 4;

    push();
    translate(this.x, this.y + bob);
    rotate(sin(frameCount * 0.02 + this.bobOffset) * 0.08);
    scale(0.82);
    noStroke();

    drawingContext.shadowBlur = 9;
    drawingContext.shadowColor = color(15, 18, 28, 160);

    if (this.stageNum === 1) {
      if (this.type === 'feather') {
        fill(10, 12, 20, 245);
        ellipse(0, -1, 15, 34);
        fill(40, 45, 65, 235);
        ellipse(4, -3, 8, 26);
        stroke(120, 130, 160, 160);
        strokeWeight(2);
        line(0, -18, 0, 17);
        line(0, -8, 8, -14);
        line(0, 0, 9, -4);
        line(0, 7, -8, 3);
        noStroke();
      } else if (this.type === 'rain') {
        fill(12, 20, 36, 240);
        beginShape();
        vertex(0, -23);
        bezierVertex(13, -7, 14, 6, 0, 17);
        bezierVertex(-14, 6, -13, -7, 0, -23);
        endShape(CLOSE);
        fill(95, 135, 185, 110);
        ellipse(4, -7, 5, 13);
      } else {
        fill(16, 18, 30, 238);
        ellipse(-7, 2, 20, 16);
        ellipse(5, -4, 26, 24);
        ellipse(16, 3, 15, 13);
        fill(95, 105, 135, 105);
        ellipse(4, -7, 7, 4);
      }
    } else {
      if (this.type === 'can') {
        fill(185, 192, 203, 245);
        rect(-12, -15, 24, 30, 5);
        fill(98, 118, 145, 235);
        rect(-10, -5, 20, 9, 3);
        fill(230, 237, 242, 150);
        ellipse(0, -15, 22, 5);
        ellipse(0, 15, 21, 5);
        fill(120, 135, 150, 145);
        triangle(-10, 3, -1, -3, -10, -7);
      } else if (this.type === 'bottle') {
        fill(35, 95, 72, 235);
        rect(-5, -25, 10, 10, 3);
        rect(-9, -16, 18, 9, 3);
        rect(-11, -8, 22, 27, 5);
        fill(165, 230, 195, 110);
        rect(1, -13, 5, 21, 3);
        fill(42, 92, 70, 200);
        triangle(8, 8, 23, 5, 10, 15);
        triangle(-8, 12, -23, 18, -10, 18);
      } else if (this.type === 'bag') {
        fill(235, 240, 246, 190);
        rect(-15, -13, 30, 27, 7);
        noFill();
        stroke(205, 215, 230, 170);
        strokeWeight(3);
        arc(-6, -14, 10, 13, PI, TWO_PI);
        arc(6, -14, 10, 13, PI, TWO_PI);
        noStroke();
        fill(120, 145, 170, 115);
        rect(-8, 1, 16, 4, 2);
      } else if (this.type === 'gust') {
        noFill();
        stroke(195, 225, 255, 220);
        strokeWeight(4);
        arc(-7, 4, 31, 26, HALF_PI, TWO_PI);
        arc(8, -7, 39, 33, PI, TWO_PI + HALF_PI);
        stroke(235, 248, 255, 160);
        strokeWeight(2);
        line(0, -30, 0, -16);
        line(-7, -22, 7, -22);
        noStroke();
      } else {
        stroke(18, 20, 28, 245);
        strokeWeight(4);
        noFill();
        line(-22, -10, 22, 10);
        line(-20, 11, 20, -11);
        line(-14, 0, 14, 0);
        noStroke();
        fill(25, 27, 38, 245);
        rect(-7, -7, 14, 14, 3);
        fill(95, 105, 125, 150);
        rect(-3, -3, 6, 6);
      }
    }

    drawingContext.shadowBlur = 0;
    pop();
  }

  checkCollision(player) {
    let bob = cos(frameCount * 0.045 + this.bobOffset) * 4;
    let d = dist(player.x, player.y, this.x, this.y + bob);
    if (d < player.radius + this.r) {
      this.collected = true;
      return true;
    }
    return false;
  }
}

// ==============================
// PARTICLES
// ==============================

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.size = random(4, 8);
    this.alpha = 255;
    this.fadeSpeed = random(2, 4);

    if (type === 'sparkle') {
  this.vx = random(-0.8, 0.8);
  this.vy = random(-1.2, -0.2);

  this.size = random(3, 7);

  this.fadeSpeed = random(1.5, 2.5);

  let c = random();

  if (c < 0.5) {
    this.c = color(180, 235, 255);
  } else if (c < 0.8) {
    this.c = color(255, 245, 180);
  } else {
    this.c = color(255);
  }
   
    } else if (type === 'burst') {
      let a = random(TWO_PI);
      let sp = random(2.3, 5.8);
      this.vx = cos(a) * sp;
      this.vy = sin(a) * sp;
      this.size = random(4, 9);
      this.fadeSpeed = random(4, 7);
      this.c = color(255, 218, 62);
    } else if (type === 'cloud') {
      this.vx = random(-1.6, 1.6);
      this.vy = random(-0.9, 0.4);
      this.size = random(8, 18);
      this.fadeSpeed = random(4, 6);
      this.c = color(255, 255, 255, 185);
    } else if (type === 'storm') {
      let a = random(TWO_PI);
      let sp = random(1.4, 4.2);
      this.vx = cos(a) * sp;
      this.vy = sin(a) * sp - 1.0;
      this.size = random(5, 11);
      this.fadeSpeed = random(5, 8);
      this.c = random() < 0.55 ? color(150, 190, 225) : color(72, 82, 100);
    } else if (type === 'splash') {
      let a = random(TWO_PI);
      let sp = random(1.2, 4.5);
      this.vx = cos(a) * sp;
      this.vy = sin(a) * sp - 0.6;
      this.size = random(4, 9);
      this.fadeSpeed = random(5, 9);
      this.c = random() < 0.4 ? color(255, 90, 95) : color(70, 72, 82);
    } else if (type === 'smoke') {
      this.vx = random(-0.35, 0.35);
      this.vy = random(-0.75, -0.15);
      this.size = random(7, 14);
      this.fadeSpeed = random(2.5, 4.2);
      this.c = color(42, 43, 52, 155);
    } else if (type === 'heart') {
      this.vx = random(-0.5, 0.5);
      this.vy = random(-1.5, -0.5);
      this.size = random(9, 15);
      this.fadeSpeed = random(2.5, 4);
      this.c = color(255, 125, 150);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.fadeSpeed;
  }

  draw() {
    push();
    noStroke();

    let c = color(red(this.c), green(this.c), blue(this.c), this.alpha);
    fill(c);

    if (this.type === 'sparkle') {

  push();

  translate(this.x, this.y);

  stroke(c);
  strokeWeight(1.4);

  line(-this.size, 0, this.size, 0);
  line(0, -this.size, 0, this.size);

  strokeWeight(0.8);

  line(
    -this.size * 0.6,
    -this.size * 0.6,
    this.size * 0.6,
    this.size * 0.6
  );

  line(
    -this.size * 0.6,
    this.size * 0.6,
    this.size * 0.6,
    -this.size * 0.6
  );

  pop();

} else if (this.type === 'burst') {

  drawingContext.shadowBlur = 7;
  drawingContext.shadowColor = c;

  rectMode(CENTER);

  translate(this.x, this.y);

  rotate(frameCount * 0.045);

  rect(0, 0, this.size, this.size, 1);

} else if (this.type === 'heart') {
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = c;
      drawHeartShape(this.x, this.y, this.size);
    } else {
      ellipse(this.x, this.y, this.size, this.size);
    }

    pop();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  add(particle) {
    this.particles.push(particle);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    for (let p of this.particles) {
      p.draw();
    }
  }

  clear() {
    this.particles = [];
  }
}
