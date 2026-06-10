// ==========================================
// UNIFIED SKETCH.JS
// Integrates game.js and story.js
// ==========================================

let currentScene = 'TITLE';
let bgmSound = null;
let bgmReady = false;
let bgmStarted = false;
let bgmVolume = 0.42; 
// States: TITLE, HOW, STORY_PROLOGUE, STAGE1, STORY_MIDDLE, STAGE2, ENDING1, ENDING2, ENDING3, TRUE_ENDING
let ending1Img, ending2Img, ending3Img;
let endingEnterFrame = 0;

function preload() {
  preloadGame();
  preloadStory();
  
  ending1Img = loadImage('ending1.png', () => {}, () => { ending1Img = null; });
  ending2Img = loadImage('ending2.png', () => {}, () => { ending2Img = null; });
  ending3Img = loadImage('ending3.png', () => {}, () => { ending3Img = null; });

  bgmSound = loadSound('bgm.mp3',
    () => { bgmReady = true; },
    () => { bgmSound = null; bgmReady = false; }
  );
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
  loadBgmVolume();
  tryStartBgm();
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
    if (gameState === 'GAMEOVER') {
      drawGameScaled();
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
    
    if (window.stage1Timer > 0 && (typeof stageIntroTimer === 'undefined' || stageIntroTimer <= 0) && (typeof gamePauseMenuOpen === 'undefined' || !gamePauseMenuOpen)) window.stage1Timer--;
    
    if (window.stage1Timer <= 0 && (memoryCollected < MEMORY_TARGET || player.y < STAGE1_GATE_Y - 120)) {
      setEndingScene('ENDING1');
      return;
    } else if (player.hearts <= 0) {
      triggerGameOver();
      drawGameScaled();
      return;
    }
    
    drawGameScaled();
    drawStage1TimerOverlay();
    
  } else if (currentScene === 'STAGE2') {
    if (gameState === 'GAMEOVER') {
      drawGameScaled();
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
      triggerGameOver();
      drawGameScaled();
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
  
  if (typeof gameState !== 'undefined' && gameState === 'GAMEOVER') {
    drawGameOverScene();
  } else {
    drawPlayingScene();
  } 
  
  drawingContext.restore();
  pop();
}




function drawEndingImage(img, titleText, descText) {
  background(0);
  updateGameScreenSize();

  let passed = frameCount - endingEnterFrame;
  let imgAlpha = constrain(map(passed, 0, 100, 0, 255), 0, 255);
  let textAlpha = constrain(map(passed, 65, 150, 0, 255), 0, 255);
  let blackAlpha = constrain(map(passed, 250, 355, 0, 245), 0, 245);
  let choiceAlpha = constrain(map(passed, 330, 430, 0, 255), 0, 255);

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
  fill(0, 0, 0, 95 * (imgAlpha / 255));
  rect(gameW / 2, gameH / 2, gameW, gameH);

  let endingTextFade = constrain(map(passed, 235, 315, 1, 0), 0, 1);
  let panelY = gameH - 238;
  fill(0, 0, 0, 152 * (textAlpha / 255) * endingTextFade);
  rect(gameW / 2, panelY, gameW - 60, 152, 18);

  fill(255, 245, 232, textAlpha * endingTextFade);
  textFont('serif');
  textSize(34);
  text(titleText, gameW / 2, panelY - 28);

  let parts = String(descText).split('\n');
  fill(255, 245, 232, textAlpha * 0.95 * endingTextFade);
  textSize(19);
  if (parts.length > 0) text(parts[0], gameW / 2, panelY + 8);
  fill(255, 245, 232, textAlpha * 0.78 * endingTextFade);
  textSize(15);
  if (parts.length > 1) text(parts.slice(1).join(' '), gameW / 2, panelY + 42);

  fill(0, 0, 0, blackAlpha);
  rect(gameW / 2, gameH / 2, gameW, gameH);

  if (choiceAlpha > 0) {
    drawEndingAfterChoice(choiceAlpha);
  }

  pop();
}

function drawEndingAfterChoice(alphaValue) {
  textAlign(CENTER, CENTER);

  textFont('serif');
  fill(255, 246, 230, alphaValue);
  textSize(48);
  text('아직 끝나지 않았어.', gameW / 2, gameH / 2 - 120);

  textFont('Noto Sans KR, Pretendard, sans-serif');
  fill(255, 246, 230, alphaValue * 0.82);
  textSize(18);
  text('다시 한 번, 너를 만나러 가볼까?', gameW / 2, gameH / 2 - 60);

  drawEndingButton(gameW / 2 - 155, gameH / 2 + 55, 240, 66, '다시하기', alphaValue);
  drawEndingButton(gameW / 2 + 155, gameH / 2 + 55, 240, 66, '포기하기', alphaValue);

  fill(255, 246, 230, alphaValue * 0.58);
  textSize(14);
  text('R : 다시하기  ·  ESC : 포기하기', gameW / 2, gameH / 2 + 128);
}

function drawEndingButton(x, y, w, h, label, alphaValue) {
  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);
  let hover = alphaValue > 180 && mx > x - w / 2 && mx < x + w / 2 && my > y - h / 2 && my < y + h / 2;

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
  textSize(21);
  text(label, x, y);
}

function handleEndingChoiceMouse() {
  let passed = frameCount - endingEnterFrame;
  if (passed < 330) return false;

  let mx = screenToGameX(mouseX);
  let my = screenToGameY(mouseY);

  if (mx > gameW / 2 - 155 - 120 && mx < gameW / 2 - 155 + 120 &&
      my > gameH / 2 + 55 - 33 && my < gameH / 2 + 55 + 33) {
    restartStageFromEnding();
    return true;
  }

  if (mx > gameW / 2 + 155 - 120 && mx < gameW / 2 + 155 + 120 &&
      my > gameH / 2 + 55 - 33 && my < gameH / 2 + 55 + 33) {
    goTitleFromEnding();
    return true;
  }

  return false;
}

function restartStageFromEnding() {
  let retryStage = (typeof stage !== 'undefined' && stage === 2) ? 2 : 1;
  currentScene = retryStage === 2 ? 'STAGE2' : 'STAGE1';
  startStage(retryStage);
  if (retryStage === 1) {
    window.stage1Timer = 180 * 60;
  }
}

function goTitleFromEnding() {
  currentScene = 'TITLE';
  currentScreen = 'title';
  cameraY = 0;
  memoryCollected = 0;
  gameState = 'START';
  player = new Player(600 / 2, 120);
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
  fill(255, 255, 255, 225);
  textFont('Noto Sans KR, Pretendard, sans-serif');
  textSize(18);
  textAlign(CENTER, TOP);
  let s = Math.ceil(window.stage1Timer / 60);
  let mins = Math.floor(s / 60);
  let secs = s % 60;
  text(`남은 시간 ${mins}:${secs < 10 ? '0' : ''}${secs}`, windowWidth / 2, 66);
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



function loadBgmVolume() {
  try {
    let raw = localStorage.getItem('cat_descent_bgm_volume');
    if (raw !== null) {
      let v = parseFloat(raw);
      if (!isNaN(v)) {
        bgmVolume = constrain(v, 0, 1);
      }
    }
  } catch (e) {
    bgmVolume = 0.42;
  }
}

function saveBgmVolume() {
  try {
    localStorage.setItem('cat_descent_bgm_volume', String(bgmVolume));
  } catch (e) {
    // 저장 실패 시 무시
  }
}

function setBgmVolume(v) {
  bgmVolume = constrain(v, 0, 1);
  saveBgmVolume();

  if (bgmSound && bgmReady) {
    try {
      bgmSound.setVolume(bgmVolume);
    } catch (e) {
      // 볼륨 적용 실패 시 무시
    }
  }
}

function getBgmVolumePercent() {
  return Math.round((typeof bgmVolume === 'number' ? bgmVolume : 0.42) * 100);
}


function tryStartBgm() {
  if (!bgmSound || !bgmReady) {
    return;
  }

  try {
    if (typeof userStartAudio === 'function') {
      userStartAudio();
    }

    bgmSound.setVolume(bgmVolume);

    if (!bgmStarted) {
      bgmSound.loop();
      bgmStarted = true;
    } else if (!bgmSound.isPlaying()) {
      bgmSound.loop();
    }
  } catch (e) {
    // 브라우저 자동재생 제한 때문에 실패하면 다음 클릭/키 입력 때 다시 시도
  }
}

function stopBgmIfNeeded() {
  // 현재는 모든 화면에서 계속 배경음이 흐르도록 유지
}


function mousePressed() {
  tryStartBgm();
  if (currentScene === 'TITLE' || currentScene === 'HOW' || currentScene === 'STORY_PROLOGUE' || currentScene === 'STORY_MIDDLE' || currentScene === 'TRUE_ENDING') {
    mousePressedStory();
    syncStoryState();
  } else if (currentScene === 'STAGE1' || currentScene === 'STAGE2') {
    handleGameMousePressed();
  } else if (currentScene === 'ENDING1' || currentScene === 'ENDING2' || currentScene === 'ENDING3') {
    handleEndingChoiceMouse();
  }
}

function keyPressed() {
  tryStartBgm();
  if (currentScene === 'TITLE' || currentScene === 'HOW' || currentScene === 'STORY_PROLOGUE' || currentScene === 'STORY_MIDDLE' || currentScene === 'TRUE_ENDING') {
    keyPressedStory();
    syncStoryState();
  } else if (currentScene === 'STAGE1' || currentScene === 'STAGE2') {
    keyPressedGame();
  } else if (currentScene === 'ENDING1' || currentScene === 'ENDING2' || currentScene === 'ENDING3') {
    if (key === 'r' || key === 'R') {
      restartStageFromEnding();
    } else if (keyCode === ESCAPE) {
      goTitleFromEnding();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
