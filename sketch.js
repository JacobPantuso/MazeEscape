 /**
 * MazeEscape
 * A simple maze game where the player navigates through a maze to reach the exit. Levels
 * become progressively harder as the player advances (randomly generated). Detailed comments
 * have been provided on more complex functions to explain their purpose and functionality.
 * 
 * Designed and Coded by Giancarlo Evacula, Jacob Pantuso, and Alexander Stan
 * 
 */
let highestScore = 0;
let currentScore = 0;
let gameState = "title";
let wallTexture;
let exitImg;
let wallGroup;
let tileFloor;
let pauseScreen;
let player;
let playerImg;
let playerImgFlash;
let tileSize = 24;
let exitSprite;
let selectedLevel = 0;
let overlay;
let overlayGfx;
let scoreFont, titleFont, regularFont, regularFont2, otherFont;
let coinImg;
let hiddenItems = [];
let imgBackground;

function preload() {
  imgBackground = loadImage("img/bg.jpg", () => {
    imgBackground.resize(width, height);
  });
  playerImg = loadImage("img/player.png");
  playerImgFlash = loadImage("img/flashlight_player.png");
  tileFloor = loadImage("img/floor_model.jpg", () => {
    tileFloor.resize(64, 64);
  });
  wallTexture = loadImage("img/wall_texture.jpg", () => {
    wallTexture.resize(49, 49);
  });
  exitImg = loadImage("img/portal.png", () => {
    exitImg.resize(36, 36);
  });
  scoreFont = loadFont("typeface/abduction2002.ttf");
  titleFont = loadFont("typeface/vanillaWhale.otf");
  regularFont = loadFont("typeface/enchantedLand.otf");
  regularFont2 = loadFont("typeface/psg.ttf");
  otherFont = loadFont("typeface/brokenDetroit.ttf");
  coinImg = loadImage("img/item.png", () => {
    coinImg.resize(32, 32);
  });
}

function setup() {
  new Canvas(800, 600);
  world.gravity.y = 0;

  overlayGfx = createGraphics(width, height);
  overlayGfx.pixelDensity(1);

  wallGroup = new Group();
  overlay = new Sprite();
  overlay.w = width;
  overlay.h = height;
  overlay.layer = 3;
  overlay.collider = "none";
  overlay.img = overlayGfx;
  overlay.visible = false;
  angleMode(degrees);

  if (localStorage.getItem("highestScore") !== null) {
    highestScore = parseInt(localStorage.getItem("highestScore"));
  }
  
  if (localStorage.getItem("progress") === null) {
    localStorage.setItem("progress", JSON.stringify([
      { level: 1, completed: false },
      { level: 2, completed: false },
      { level: 3, completed: false },
      { level: 4, completed: false },
      { level: 5, completed: false }
    ]));
  }
}

function draw() {
  clear();

  if (gameState === "title") {
    drawTitleScreen();
  } else if (gameState === "select") {
    if (kb.pressed("b")) {
      gameState = "title";
    }
    drawSelectScreen();
  } else if (gameState === "play") {
    for (let i = 0; i < wallGroup.length; i++) {
      wallGroup[i].visible = true;
    }
    player.visible = true;
    runGame();

  } else if (gameState === "paused") {
    for (let i = 0; i < wallGroup.length; i++) {
      wallGroup[i].visible = false;
    }
    player.visible = false;
    overlay.visible = false;
    drawPauseScreen();
    runGame();
  }
}

function drawPauseScreen() {
  textFont(titleFont);
  background(0, 150);
  textAlign(CENTER, CENTER);
  textSize(56);
  fill(255);
  text("Paused", width / 2, height / 2 - 40);
  textSize(28);
  textFont(regularFont);
  fill(255);
  text("Press", width / 2 - 65, height / 2 + 20);
  fill("orange");
  text("ESC", width / 2 - 15, height / 2 + 20);
  fill(255);
  text("to continue.", (width / 2) + 55, height / 2 + 20);
  text("Press", width / 2 - 75, height / 2 + 50);
  fill("orange"); 
  text("M", (width / 2) - 33, height / 2 + 50);
  fill(255);
  text("to return to menu.", (width / 2) + 50, height / 2 + 50);
}


function drawTitleScreen() {
  background(imgBackground);
  textAlign(CENTER, CENTER);
  textSize(68);
  fill(255);
  textFont(titleFont);
  text("MazeEscape", width / 2, height / 2 - 40);
  textSize(36);
  textFont(regularFont);
  text("Click anywhere to start", width / 2, height / 2 + 40);
  
  // how to play
  textSize(26);
  textFont(regularFont2);
  fill(255);
  text("How to play:", width / 2, height / 2 + 100);
  textSize(20);
  textFont(regularFont2);
  text("Use WASD or Arrow keys to move", width / 2, height / 2 + 130);
  text("Reach the exit to complete the level, hidden items give you extra score!", width / 2, height / 2 + 160);
  text("Press ESC to pause the game", width / 2, height / 2 + 190);
}

/**
 * Draws the level selection screen.
 * It displays the levels and their completion status.
 * Levels are colored based on their completion status.
 */
function drawSelectScreen() {
  background(imgBackground);
  textAlign(CENTER, CENTER);
  textSize(48);
  textFont(otherFont)
  fill(255);
  text("Select a Level", width / 2, 150);
  textSize(36);
  textFont(regularFont);
  text("Highest Score:   " + highestScore, width / 2, 100);

  textSize(36);
  textFont(regularFont2);
  let levelProgress = JSON.parse(localStorage.getItem("progress"));
  for (let i = 1; i <= 5; i++) {
    let levelData = levelProgress[i - 1];
    let levelText;

    if (i === 1 || levelProgress[i - 2]?.completed) {
      fill(levelData.completed ? "green" : "skyblue");
      levelText = `Level ${i}`;
    } else {
      fill("red");
      levelText = `Level ${i}`;
    }

    text(levelText, width / 2, 170 + i * 50);
  }

  fill("white")
  text("Press", width / 2 - 140, height - 100);
  fill("orange"); 
  text("B", (width / 2) - 77,height - 100);
  fill(255);
  text("to return to start.", (width / 2) + 70, height - 100);
}

function mousePressed() {
  if (gameState === "title") {
    gameState = "select";
  } else if (gameState === "select") {
    for (let i = 1; i <= 5; i++) {
      if (mouseY > 150 + i * 50 - 20 && mouseY < 150 + i * 50 + 20) {
        let levelProgress = JSON.parse(localStorage.getItem("progress"));

        if (i === 1 || levelProgress[i - 2]?.completed) {
          selectedLevel = i;
          wallGroup.removeAll();
          if (exitSprite) exitSprite.remove();
          if (player) player.remove();
          if (hiddenItems) hiddenItems.forEach(item => item.remove());
          if (hiddenItems) hiddenItems = [];
          loadRandomMazeLevel(15, 10);
        
          gameState = "play";
        }
        break;
      }
    }
  }
}

/**
 * Updates the overlay graphics to create a flashlight effect.
 * It draws a dark overlay on the screen and carves out a circle
 * at the player's position to simulate a flashlight.
 * 
 */
function updateOverlayFlashlight() {
  overlayGfx.clear(); // clear previous frame

  // Draw dark overlay
  overlayGfx.fill(0, 255); // dark screen
  overlayGfx.noStroke();
  overlayGfx.rect(0, 0, width, height);

  // Carve circle at flashlight position
  let screenX = width / 2 + (player.x - camera.x) * camera.zoom;
  let screenY = height / 2 + (player.y - camera.y) * camera.zoom;

  overlayGfx.erase();
  overlayGfx.ellipse(screenX, screenY, 160, 160);
  overlayGfx.noErase();
}


function runGame() {
  camera.on();
  camera.x = player.x;
  camera.y = player.y;
  camera.zoom = 2.5;

  if (selectedLevel > 1 && gameState !== "paused") {
    updateOverlayFlashlight();
    overlay.visible = true;
    overlay.layer = 3;
    overlay.x = player.x;
    overlay.y = player.y;
  }

  if (gameState !== "paused") {
    if (kb.pressing("w") || kb.pressing("up")) player.vel.y = -2;
    else if (kb.pressing("s") || kb.pressing("down")) player.vel.y = 2;
    else player.vel.y = 0;

    if (kb.pressing("a") || kb.pressing("left")) {
      player.mirror.x = true;
      player.vel.x = -2;
    } else if (kb.pressing("d") || kb.pressing("right")) {
      player.mirror.x = false;
      player.vel.x = 2;
    } else player.vel.x = 0;
  } else {
    player.vel.x = 0;
    player.vel.y = 0;
    if (kb.pressed("m")) {
      wallGroup.removeAll();
      if (exitSprite) exitSprite.remove();
      if (player) player.remove();
      gameState = "select";
    }
  }

  // Toggle pause state with ESC
  if (kb.pressed("escape")) {
    gameState = (gameState === "paused") ? "play" : "paused";
  }

  if (gameState !== "paused") {
    hiddenItems.forEach(item => {
      if (player.overlaps(item)) {
        item.remove();
        currentScore += Math.floor(Math.random() * 100) + 1; 
        item.remove();
      }
    });
    if (currentScore > highestScore) {
      highestScore = currentScore;
      localStorage.setItem("highestScore", highestScore);
    }
  }

  // Only check for win if not paused
  if (gameState !== "paused" && player.overlaps(exitSprite)) {
    let levelProgress = JSON.parse(localStorage.getItem("progress"));
    levelProgress[selectedLevel - 1].completed = true;
    localStorage.setItem("progress", JSON.stringify(levelProgress));
    wallGroup.removeAll();
    if (typeof floorGroup !== "undefined") floorGroup.removeAll();
    if (exitSprite) exitSprite.remove();
    if (player) player.remove();
    overlay.visible = false;
    gameState = "select";
  }
}

/**
 * Initializes the maze level into the canvas.
 * @param {number} cols 
 * @param {number} rows 
 * @calls {generateMaze} to create a random maze.
 */
function loadRandomMazeLevel(cols, rows) {
  let { maze, exit } = generateMaze(cols, rows);
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      let cell = maze[y][x];
      let xPos = x * tileSize + tileSize / 2;
      let yPos = y * tileSize + tileSize / 2;

      if (cell === "#") {
        let wall = new wallGroup.Sprite();
        wall.x = xPos;
        wall.y = yPos;
        wall.w = tileSize;
        wall.h = tileSize;
        wall.collider = "static";
        wall.img = wallTexture;
        wall.layer = 2;
      }

      if (cell === ".") {
        let floor = new wallGroup.Sprite();
        floor.x = xPos;
        floor.y = yPos;
        floor.w = tileSize;
        floor.h = tileSize;
        floor.collider = "none";
        floor.img = tileFloor;
        floor.layer = 1;
        }
      }
    }

  for (let i = 0; i < 5; i++) {
    let x = Math.floor(Math.random() * cols) * 2 + 1;
    let y = Math.floor(Math.random() * rows) * 2 + 1;
    if (maze[y][x] === ".") {
      let hiddenItem = new wallGroup.Sprite();
      hiddenItem.x = x * tileSize + tileSize / 2;
      hiddenItem.y = y * tileSize + tileSize / 2;
      hiddenItem.w = tileSize;
      hiddenItem.h = tileSize;
      hiddenItem.layer = 1;
      hiddenItem.collider = "none";
      hiddenItem.img = coinImg;
      hiddenItems.push(hiddenItem);
    }
  }

  exitSprite = new Sprite();
  exitSprite.x = (exit.x + 1) * tileSize + tileSize / 2;
  exitSprite.y = exit.y * tileSize + tileSize / 2;
  exitSprite.w = tileSize;
  exitSprite.h = tileSize;
  exitSprite.collider = "none";
  exitSprite.img = exitImg;
  exitSprite.layer = 2;
  exitSprite.label = "exit";

  createPlayer(tileSize * 1.5, tileSize * 1.5);
  
}

/**
 * Creates the player sprite.
 * It sets the player image, scale, position, width, height, collider type and rotation lock.
 * @param {coordinate} x - The x position of the player.
 * @param {coordinate} y - The y position of the player.
 */
function createPlayer(x, y) {
  player = new Sprite();
  if (selectedLevel === 1) {
    player.img = playerImg;
  } else {
    player.img = playerImgFlash;
  }
  player.scale = 0.13;
  player.x = x;
  player.y = y;
  player.w = tileSize * 0.6;
  player.h = tileSize * 0.9;
  player.collider = "dynamic";
  player.rotationLock = true;
  
}

/**
 * Generates a random maze using recursive backtracking. It accepts 
 * the number of columns and rows as parameters. The maze is represented
 * as a 2D array of strings, where "#" represents walls and "." represents paths.
 * 
 * @param {*} cols 
 * @param {*} rows 
 * @returns a dictionary with the maze and the exit coordinates.
 */
function generateMaze(cols, rows) {
  let maze = Array(rows * 2 + 1).fill().map(() => Array(cols * 2 + 1).fill("#"));

  function carve(x, y) {
    // Mark the current cell as a path
    maze[y * 2 + 1][x * 2 + 1] = ".";

    // Shuffle the directions to ensure the maze is random
    let dirs = shuffle([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]);
    for (let [dx, dy] of dirs) {
      let nx = x + dx, ny = y + dy;

      // If the neighbouring cell is inside the maze and has not been visited
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny * 2 + 1][nx * 2 + 1] === "#") {
        // Create a passage between the current cell and the neighbouring cell
        maze[y * 2 + 1 + dy][x * 2 + 1 + dx] = ".";
        // Backtracking begins here, we recursively carve the neighbouring cell
        carve(nx, ny);
      }
    }
  }

  // We start carving from the very top-left corner.
  carve(0, 0);

  // Determine the exit position
  // The exit is placed at the bottom-right corner of the maze.
  // The exit is represented by two adjacent cells to ensure the player can pass through.
  let exitY = rows * 2 - 1;
  let exitX = cols * 2 - 1;

  maze[exitY][exitX] = ".";
  maze[exitY][exitX + 1] = ".";

  
  return { maze, exit: { x: exitX, y: exitY } };
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * This algorithm is used to randomize the order of elements in an array.
 * @param {*} arr 
 * @returns {*} - The shuffled array.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
