const canvas = document.getElementById("board");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const startButton = document.getElementById("start");
const fullscreenButton = document.getElementById("fullscreen");

const blockSize = 24;
const columns = 10;
const rows = 20;

const colors = [
  null,
  "#ff7b00",
  "#00f5a0",
  "#3df5ff",
  "#ffe600",
  "#c56bff",
  "#ff2d55",
  "#00d2ff",
];

const shapes = [
  [],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 2, 2],
    [2, 2, 0],
    [0, 0, 0],
  ],
  [
    [3, 3, 0],
    [0, 3, 3],
    [0, 0, 0],
  ],
  [
    [4, 4],
    [4, 4],
  ],
  [
    [0, 5, 0],
    [0, 5, 0],
    [0, 5, 5],
  ],
  [
    [0, 6, 0],
    [0, 6, 0],
    [6, 6, 0],
  ],
  [
    [0, 0, 0, 0],
    [7, 7, 7, 7],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];

let board = createBoard();
let current = null;
let dropCounter = 0;
let lastTime = 0;
let dropInterval = 1000;
let score = 0;
let lines = 0;
let level = 1;
let isRunning = false;

const scaleX = canvas.width / (columns * blockSize);
const scaleY = canvas.height / (rows * blockSize);
context.setTransform(scaleX, 0, 0, scaleY, 0, 0);

function createBoard() {
  return Array.from({ length: rows }, () => Array(columns).fill(0));
}

function createPiece() {
  const type = Math.floor(Math.random() * (shapes.length - 1)) + 1;
  const shape = shapes[type].map((row) => row.slice());
  return {
    matrix: shape,
    pos: {
      x: Math.floor(columns / 2) - Math.ceil(shape[0].length / 2),
      y: 0,
    },
  };
}

function collide(boardState, piece) {
  for (let y = 0; y < piece.matrix.length; y += 1) {
    for (let x = 0; x < piece.matrix[y].length; x += 1) {
      if (piece.matrix[y][x] !== 0) {
        const boardY = y + piece.pos.y;
        const boardX = x + piece.pos.x;
        if (
          boardY >= rows ||
          boardX < 0 ||
          boardX >= columns ||
          (boardY >= 0 && boardState[boardY][boardX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(boardState, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        boardState[y + piece.pos.y][x + piece.pos.x] = value;
      }
    });
  });
}

function rotate(matrix) {
  const rotated = matrix.map((row, i) => row.map((_, j) => matrix[matrix.length - 1 - j][i]));
  return rotated;
}

function playerRotate() {
  const previous = current.matrix;
  current.matrix = rotate(current.matrix);
  if (collide(board, current)) {
    current.matrix = previous;
  }
}

function playerMove(direction) {
  current.pos.x += direction;
  if (collide(board, current)) {
    current.pos.x -= direction;
  }
}

function playerDrop() {
  current.pos.y += 1;
  if (collide(board, current)) {
    current.pos.y -= 1;
    merge(board, current);
    resetPiece();
    sweepLines();
  }
  dropCounter = 0;
}

function hardDrop() {
  while (!collide(board, current)) {
    current.pos.y += 1;
  }
  current.pos.y -= 1;
  merge(board, current);
  resetPiece();
  sweepLines();
  dropCounter = 0;
}

function sweepLines() {
  let rowCount = 0;
  outer: for (let y = rows - 1; y >= 0; y -= 1) {
    for (let x = 0; x < columns; x += 1) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    y += 1;
    rowCount += 1;
  }

  if (rowCount > 0) {
    const points = [0, 40, 100, 300, 1200];
    score += points[rowCount] * level;
    lines += rowCount;
    if (lines >= level * 10) {
      level += 1;
      dropInterval = Math.max(150, 1000 - (level - 1) * 80);
    }
    updateStats();
  }
}

function resetPiece() {
  current = createPiece();
  if (collide(board, current)) {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    updateStats();
  }
}

function update(time = 0) {
  if (!isRunning) {
    return;
  }
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function drawBlock(value, x, y) {
  if (value === 0) {
    return;
  }
  context.fillStyle = colors[value];
  context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  context.strokeStyle = "rgba(0, 0, 0, 0.2)";
  context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function draw() {
  context.fillStyle = "#050713";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      drawBlock(value, x, y);
    });
  });

  if (current) {
    current.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        drawBlock(value, x + current.pos.x, y + current.pos.y);
      });
    });
  }
}

function updateStats() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
}

function startGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  updateStats();
  resetPiece();
  isRunning = true;
  lastTime = 0;
  dropCounter = 0;
  canvas.focus();
  requestAnimationFrame(update);
}

canvas.addEventListener("click", () => {
  canvas.focus();
});

document.addEventListener("keydown", (event) => {
  const blockedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
  if (isRunning && blockedKeys.includes(event.key)) {
    event.preventDefault();
  }
  if (!isRunning) {
    return;
  }
  if (event.key === "ArrowLeft") {
    playerMove(-1);
  } else if (event.key === "ArrowRight") {
    playerMove(1);
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === "ArrowUp") {
    playerRotate();
  } else if (event.key === " ") {
    event.preventDefault();
    hardDrop();
  }
});

startButton.addEventListener("click", () => {
  startGame();
});

fullscreenButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    document.body.classList.add("is-fullscreen");
  } else {
    document.body.classList.remove("is-fullscreen");
  }
});

updateStats();
draw();
