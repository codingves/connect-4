const cellsElement = document.querySelector(".cells");
const modalContainer = document.querySelector(".modal-container");
const turnElement = document.getElementById("turn");
const newGameBtn = document.getElementById("new-game");

const TOM = "TOM";
const JERRY = "JERRY";
const TOM_BG = "#e0f4ff";
const JERRY_BG = "#ffeed9";
const TOM_COLOR = "#757575";
const JERRY_COLOR = "#F57C00";
const CELL_BORDER_RADIUS = "12px";

let cells;
let turn;
let createdTileElement;

const showModal = (messageInnerHtml, imageSrc) => {
  const message = modalContainer.querySelector("p");
  const image = modalContainer.querySelector("img");

  message.innerHTML = messageInnerHtml;
  image.setAttribute("src", imageSrc);

  modalContainer.classList.add("show-modal");
};

const changeTurn = () => {
  turn = turn === TOM ? JERRY : TOM;
  turnElement.textContent = turn;
};

const getColumn = (y) => {
  const column = [];
  cells.forEach((cellArray) => {
    for (const cell of cellArray) {
      if (cell.y === y) column.push(cell);
    }
  });
  return column;
};

const getColumns = () => {
  const columns = [];
  for (let y = 0; y < 6; y++) {
    const column = [];
    cells.forEach((cellArray) => {
      column.push(cellArray[y]);
    });
    columns.push(column);
  }
  return columns;
};

const getTileDestinationX = (y) => {
  const column = getColumn(y);
  for (let i = 0; i < column.length; i++) {
    if (column[i].tile.value) return i - 1;
  }
  return column.length - 1;
};

const changeWinnerTilesStyle = (cellArray) => {
  setTimeout(() => {
    for (const cell of cellArray) {
      cell.tile.element.classList.add("dance-animation");
      cell.tile.element.style.setProperty("--bg", "#ffe135");
    }
  }, 1000);
};

const isNonDiagonalWinner = (cellArray) => {
  for (let i = 0; i < cellArray.length - 3; i++) {
    if (cellArray[i].tile.value) {
      if (
        cellArray[i].tile.value === cellArray[i + 1].tile.value &&
        cellArray[i].tile.value === cellArray[i + 2].tile.value &&
        cellArray[i].tile.value === cellArray[i + 3].tile.value
      ) {
        changeWinnerTilesStyle([0, 1, 2, 3].map((_i) => cellArray[i + _i]));
        return true;
      }
    }
  }
  return false;
};

const isDiagonalWinner = (_cells, isReversed = false) => {
  for (let x = 0; x < 3; x++) {
    for (let y = 3; y < _cells[x].length; y++) {
      if (_cells[x][y].tile.value) {
        if (
          _cells[x][y].tile.value === _cells[x + 1][y - 1].tile.value &&
          _cells[x][y].tile.value === _cells[x + 2][y - 2].tile.value &&
          _cells[x][y].tile.value === _cells[x + 3][y - 3].tile.value
        ) {
          if (isReversed) {
            changeWinnerTilesStyle([0, 1, 2, 3].map((i) => cells[x + i][y + i]));
          } else {
            changeWinnerTilesStyle([0, 1, 2, 3].map((i) => cells[x + i][y - i]));
          }
          return true;
        }
      }
    }
  }
};

const isWinner = () => {
  for (const row of cells) {
    if (isNonDiagonalWinner(row)) return true;
  }

  for (const column of getColumns(cells)) {
    if (isNonDiagonalWinner(column)) return true;
  }

  if (
    isDiagonalWinner(cells) ||
    isDiagonalWinner(
      [...cells].map((row) => [...row].reverse()),
      true
    )
  )
    return true;
};

const isFullTile = () => {
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.tile.value) return false;
    }
  }

  return true;
};

const createCellElements = (x, y) => {
  const cellElement = document.createElement("div");
  const cellImageElement = document.createElement("img");
  cellImageElement.setAttribute("src", "./images/cell.svg");

  if (x === 0 && y === 0) {
    cellImageElement.style.borderTopLeftRadius = CELL_BORDER_RADIUS;
  } else if (x === 0 && y === 6) {
    cellImageElement.style.borderTopRightRadius = CELL_BORDER_RADIUS;
  } else if (x === 5 && y === 0) {
    cellImageElement.style.borderBottomLeftRadius = CELL_BORDER_RADIUS;
  } else if (x === 5 && y === 6) {
    cellImageElement.style.borderBottomRightRadius = CELL_BORDER_RADIUS;
  }

  cellElement.append(cellImageElement);
  cellElement.classList.add("cell");
  cellElement.addEventListener("mouseover", () => {
    createdTileElement = document.getElementById("created-tile");
    if (!createdTileElement) return;
    createdTileElement.style.setProperty("--y", y);
  });
  cellElement.addEventListener("click", () => {
    createdTileElement = document.getElementById("created-tile");
    if (!createdTileElement) return;
    const x = getTileDestinationX(y);
    if (x !== -1) {
      const timeoutDuration = +createdTileElement.style.getPropertyValue("--y") === y ? 0 : 500;
      createdTileElement.style.setProperty("--y", y);
      setTimeout(() => {
        createdTileElement.style.setProperty("--x", x);
        cells[x][y].tile = { value: turn, element: createdTileElement };
        createdTileElement.removeAttribute("id");

        if (isWinner()) {
          setTimeout(() => {
            showModal(
              `Congrats <span style="color: ${
                turn === TOM ? TOM_COLOR : JERRY_COLOR
              }; text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)">${turn}</span>, you won!`,
              `./images/modal/winner-${turn === TOM ? "tom" : "jerry"}.png`
            );
          }, 3000);
        } else if (isFullTile()) {
          setTimeout(() => {
            showModal("It's a draw!", "./images/modal/draw.png");
          }, 1000);
        } else {
          changeTurn();
          createTile(y);
        }
      }, timeoutDuration);
    }
  });
  cellsElement.append(cellElement);
};

const createCells = () => {
  for (let x = 0; x < 6; x++) {
    const cellArray = [];
    for (let y = 0; y < 7; y++) {
      cellArray.push({ x, y, tile: { value: null, element: null } });
      createCellElements(x, y);
    }
    cells.push(cellArray);
  }
};

const createTile = (y) => {
  const tileElement = document.createElement("div");
  const tileImageElement = document.createElement("img");
  if (turn === TOM) {
    tileImageElement.setAttribute("src", "./images/cell/tom.png");
    tileElement.style.setProperty("--bg", TOM_BG);
  } else if (turn === JERRY) {
    tileImageElement.setAttribute("src", "./images/cell/jerry.png");
    tileElement.style.setProperty("--bg", JERRY_BG);
  }
  tileElement.append(tileImageElement);
  tileElement.style.setProperty("--x", -1.1);
  tileElement.style.setProperty("--y", y);
  tileElement.classList.add("tile");
  tileElement.setAttribute("id", "created-tile");
  cellsElement.append(tileElement);
};

const startGame = () => {
  cells = [];
  turn = Math.random() > 0.5 ? TOM : JERRY;

  turnElement.textContent = turn;
  createCells();
  createTile(0);
};

newGameBtn.addEventListener("click", () => {
  modalContainer.classList.remove("show-modal");
  document.querySelectorAll(".tile").forEach((tileElement) => tileElement.remove());
  document.querySelectorAll(".cell").forEach((cellElement) => cellElement.remove());
  startGame();
});

startGame();
