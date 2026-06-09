// ==========================================
// UNIFIED SKETCH.JS
// Integrates game.js and story.js
// ==========================================

let currentScene = 'TITLE'; 
// States: TITLE, HOW, STORY_PROLOGUE, STAGE1, STORY_MIDDLE, STAGE2, ENDING1, ENDING2, ENDING3, TRUE_ENDING
let ending1Img, ending2Img, ending3Img;
let endingEnterFrame = 0;

function preload() {
  preloadGame();
  preloadStory();
  
  ending1Img = loadImage(ASSET_PATH + 'ending1.png', () => {}, () => { ending1Img = null; });
  ending2Img = loadImage(ASSET_PATH + 'ending2.png', () => {}, () => { ending2Img = null; });
  ending3Img = loadImage(ASSET_PATH + 'ending3.png', () => {}, () => { ending3Img = null; });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Setup Game Globals
  pixelDensity(1);
  noSmooth();
  textAlign(CENTER, CENTER);
  imageMode(CENTER);
  rectMode(CORNER);
  
  generateBackground();
  particles = new ParticleSystem();
  player = new Player(600 / 2, 120);
  
  // Setup Story Globals
  makeButtons();
  makePrologueData();
  makeMiddleData();
  makeTrueEndingData();
  storyData = prologueData;
  
  // Initial States
  currentScreen = 'title';
  gameState = 'START';
  window.stage1Timer = 180 * 60; // 3 minutes at 60 fps
}

function syncStoryState() {
  if (currentScene === 'TITLE' && currentScreen === 'how') currentScene = 'HOW';
  if (currentScene === 'HOW' && currentScreen === 'title') currentScene = 'TITLE';
  if (currentScene === 'TITLE' && currentScreen === 'story') {
    if (nextScreenAfterStory === 'heavenReady') currentScene = 'STORY_PROLOGUE';
  }
  if (currentScene === 'TRUE_ENDING' && currentScreen === 'title') {
    currentScene = 'TITLE';
  }
}


function draw() {
  background(10);
  
  if (currentScene === 'TITLE' || currentScene === 'HOW' || currentScene === 'STORY_PROLOGUE' || currentScene === 'STORY_MIDDLE' || currentScene === 'TRUE_ENDING') {
    push();
    imageMode(CORNER);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    drawStory();
    pop();
    
    if (currentScreen === 'heavenReady' && frameCount - readyScreenEnterFrame > 105) {
      currentScene = 'STAGE1';
      startStage(1);
      window.stage1Timer = 180 * 60;
    } else if (currentScreen === 'earthReady' && frameCount - readyScreenEnterFrame > 105) {
      currentScene = 'STAGE2';
      startStage(2);
    }
  } else if (currentScene === 'STAGE1') {
    if (gameState === 'OFFSCREEN_ENDING2') {
      setEndingScene('ENDING2');
      return;
    }

    if (gameState === 'BAD_GATE') {
      setEndingScene('ENDING1');
      return;
    }

    if (gameState === 'STORY') {
      currentScene = 'STORY_MIDDLE';
      startMiddleStory();
      return;
    }
    
    if (window.stage1Timer > 0) window.stage1Timer--;
    
    if (window.stage1Timer <= 0 && (memoryCollected < MEMORY_TARGET || player.y < STAGE1_GATE_Y - 120)) {
      setEndingScene('ENDING1');
      return;
    } else if (player.hearts <= 0) {
      setEndingScene('ENDING2');
      return;
    }
    
    drawGameScaled();
    drawStage1TimerOverlay();
    
  } else if (currentScene === 'STAGE2') {
    if (gameState === 'OFFSCREEN_ENDING2') {
      setEndingScene('ENDING2');
      return;
    }

    if (gameState === 'ENDING') {
      if (player.hearts >= 1) {
        currentScene = 'TRUE_ENDING';
        startTrueEndingStory();
      } else {
        setEndingScene('ENDING3');
      }
      return;
    }
    
    if (player.hearts <= 0) {
      setEndingScene('ENDING3');
      return;
    }
    
    drawGameScaled();
    
  } else if (currentScene === 'ENDING1') {
    drawEndingImage(ending1Img, '엔딩 1  ·  다시 만나지 못한 약속', '기억조각을 모두 모으지 못한 채 지상문을 지나가려 했다.\n구름 장벽 너머로 희미한 방울 소리만 남았다.');
  } else if (currentScene === 'ENDING2') {
    drawEndingImage(ending2Img, '엔딩 2  ·  천국으로 돌아가다', '너무 높이 솟구쳐 화면 밖에서 오래 버티지 못했다.\n지상과의 연결이 끊기고 고양이는 다시 천국으로 돌아갔다.');
  } else if (currentScene === 'ENDING3') {
    drawEndingImage(ending3Img, '엔딩 3  ·  떠돌이 영혼', '지상에 가까워졌지만 마지막 힘이 다했다.\n고양이는 거리의 바람 속에서 주인의 집을 계속 찾는다.');
  }
}


function drawGameScaled() {
  push();
  imageMode(CENTER);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  background('#061328'); // default sky background
  
  let gameScale = min(windowWidth / 600, windowHeight / 800);
  let gameOffsetX = (windowWidth - 600 * gameScale) / 2;
  let gameOffsetY = (windowHeight - 800 * gameScale) / 2;
  translate(gameOffsetX, gameOffsetY);
  scale(gameScale);
  
  // Set clipping so game doesn't draw outside 600x800
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, 600, 800);
  drawingContext.clip();
  
  drawPlayingScene(); 
  
  drawingContext.restore();
  pop();
}


function drawEndingImage(img, titleText, descText) {
  background(0);
  updateGameScreenSize();

  let passed = frameCount - endingEnterFrame;
  let imgAlpha = constrain(map(passed, 0, 100, 0, 255), 0, 255);
  let textAlpha = constrain(map(passed, 65, 150, 0, 255), 0, 255);
  let promptAlpha = constrain(map(passed, 150, 220, 0, 210), 0, 210);
  
  push();
  imageMode(CORNER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  translate(offsetX, offsetY);
  scale(scaleRatio);
  
  if (img && img.width > 0) {
    tint(255, imgAlpha);
    drawCoverImage(img, 0, 0, gameW, gameH);
    noTint();
  } else {
    drawFallbackEndingIllustration(titleText, imgAlpha);
  }

  noStroke();
  fill(0, 0, 0, 150 * (imgAlpha / 255));
  rect(gameW / 2, gameH / 2, gameW, gameH);
  
  fill(0, 0, 0, 150 * (textAlpha / 255));
  rect(gameW / 2, gameH - 190, gameW - 120, 235, 32);

  fill(255, 246, 230, textAlpha);
  textFont('serif');
  textSize(46);
  textAlign(CENTER, CENTER);
  text(titleText, gameW / 2, gameH - 275);

  textSize(27);
  fill(255, 246, 230, textAlpha * 0.92);
  text(descText, gameW / 2, gameH - 198);

  textSize(24);
  fill(255, 246, 230, promptAlpha);
  text('ESC : 타이틀로 돌아가기', gameW / 2, gameH - 92);
  pop();
}




function setEndingScene(sceneName) {
  if (currentScene !== sceneName) {
    currentScene = sceneName;
    endingEnterFrame = frameCount;

    if (typeof unlockEnding === 'function') {
      if (sceneName === 'ENDING1') unlockEnding('ending1');
      if (sceneName === 'ENDING2') unlockEnding('ending2');
      if (sceneName === 'ENDING3') unlockEnding('ending3');
    }
  }
}

function drawStage1TimerOverlay() {
  push();
  fill(255);
  textFont('sans-serif');
  textSize(24);
  textAlign(CENTER, TOP);
  let s = Math.ceil(window.stage1Timer / 60);
  let mins = Math.floor(s / 60);
  let secs = s % 60;
  text(`남은 시간: ${mins}:${secs < 10 ? '0' : ''}${secs}`, windowWidth / 2, 40);
  pop();
}

function drawFallbackEndingIllustration(titleText, alphaValue) {
  noStroke();
  let a = alphaValue;
  fill(12, 18, 36, a);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  fill(255, 245, 210, a * 0.85);
  ellipse(gameW / 2, 360, 190, 190);
  fill(20, 26, 50, a * 0.45);
  ellipse(gameW / 2 + 45, 330, 160, 160);

  fill(120, 200, 255, a * 0.65);
  ellipse(gameW / 2, 665, 155, 135);
  fill(70, 170, 255, a);
  ellipse(gameW / 2, 760, 58, 58);
  fill(255, 255, 255, a * 0.85);
  textFont('serif');
  textSize(34);
  text('딸랑', gameW / 2, 850);
}

function mousePressed() {
  if (currentScene === 'TITLE' || currentScene === 'HOW' || currentScene === 'STORY_PROLOGUE' || currentScene === 'STORY_MIDDLE' || currentScene === 'TRUE_ENDING') {
    mousePressedStory();
    syncStoryState();
  }
}

function keyPressed() {
  if (currentScene === 'TITLE' || currentScene === 'HOW' || currentScene === 'STORY_PROLOGUE' || currentScene === 'STORY_MIDDLE' || currentScene === 'TRUE_ENDING') {
    keyPressedStory();
    syncStoryState();
  } else if (currentScene === 'STAGE1' || currentScene === 'STAGE2') {
    keyPressedGame();
  } else if (currentScene === 'ENDING1' || currentScene === 'ENDING2' || currentScene === 'ENDING3') {
    if (keyCode === ESCAPE) {
      currentScene = 'TITLE';
      currentScreen = 'title';
      player = new Player(600 / 2, 120);
      memoryCollected = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}