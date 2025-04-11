let gameState = "title";
let wallTexture;
let exitImg;
let wallGroup;
let tileFloor;
let player;
let playerImg;
let playerImgFlash;
let tileSize = 24;
let exitSprite;
let selectedLevel = 0;
let maskedBuffer;
let flashlightMask;

function preload() {
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
}

function setup() {
  new Canvas(800, 600);
  world.gravity.y = 0;

  wallGroup = new Group();

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
    drawSelectScreen();
  } else if (gameState === "play") {
    runGame();
  }
}

function drawTitleScreen() {
  background(30);
  textAlign(CENTER, CENTER);
  textSize(36);
  fill(255);
  text("MazeEscape", width / 2, height / 2 - 40);
  textSize(18);
  text("Click anywhere to start", width / 2, height / 2 + 20);
}

/**
 * Draws the level selection screen.
 * It displays the levels and their completion status.
 * Levels are colored based on their completion status.
 */
function drawSelectScreen() {
  background(50);
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(255);
  text("Select a Level", width / 2, 60);
  let levelProgress = JSON.parse(localStorage.getItem("progress"));
  for (let i = 1; i <= 5; i++) {
    let levelData = levelProgress[i - 1];
    let levelText;

    if (i === 1 || levelProgress[i - 2]?.completed) {
      fill(levelData.completed ? "green" : "skyblue");
      levelText = `Level ${i}`;
    } else {
      fill("red");
      levelText = `Level ${i} - Locked`;
    }

    text(levelText, width / 2, 100 + i * 50);
  }
}

function mousePressed() {
  if (gameState === "title") {
    gameState = "select";
  } else if (gameState === "select") {
    for (let i = 1; i <= 5; i++) {
      if (mouseY > 100 + i * 50 - 20 && mouseY < 100 + i * 50 + 20) {
        let levelProgress = JSON.parse(localStorage.getItem("progress"));

        if (i === 1 || levelProgress[i - 2]?.completed) {
          selectedLevel = i;
          wallGroup.removeAll();
          if (exitSprite) exitSprite.remove();
          if (player) player.remove();

          loadRandomMazeLevel(15, 10); 
          gameState = "play";
        }
        break;
      }
    }
  }
}


function runGame() {
  // Center camera on player
  camera.x = player.x;
  camera.y = player.y;
  camera.zoom = 2.5;

  // Movement
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

  // If the player reaches the exit and cross the portal, clear the level, 
  if (player.overlaps(exitSprite)) {
    let levelProgress = JSON.parse(localStorage.getItem("progress"));
    levelProgress[selectedLevel - 1].completed = true;
    localStorage.setItem("progress", JSON.stringify(levelProgress));

    wallGroup.removeAll();
    if (typeof floorGroup !== "undefined") floorGroup.removeAll();
    if (exitSprite) exitSprite.remove();
    if (player) player.remove();

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
      }

      if (cell === ".") {
        let floor = new wallGroup.Sprite();
        floor.x = xPos;
        floor.y = yPos;
        floor.w = tileSize;
        floor.h = tileSize;
        floor.collider = "none";
        floor.img = tileFloor;
        floor.layer = 0;
      }
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
 * Generates a random maze using recursive backtracking.
 * @param {*} cols 
 * @param {*} rows 
 * @returns a dictionary with the maze and the exit coordinates.
 */
function generateMaze(cols, rows) {
  let maze = Array(rows * 2 + 1).fill().map(() => Array(cols * 2 + 1).fill("#"));

  function carve(x, y) {
    maze[y * 2 + 1][x * 2 + 1] = ".";
    let dirs = shuffle([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]);
    for (let [dx, dy] of dirs) {
      let nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny * 2 + 1][nx * 2 + 1] === "#") {
        maze[y * 2 + 1 + dy][x * 2 + 1 + dx] = ".";
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);

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
