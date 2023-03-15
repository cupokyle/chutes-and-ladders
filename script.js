const boardSize = 100;
const chutesAndLadders = {
  1: 38,
  4: 14,
  9: 31,
  16: 6,
  21: 42,
  28: 84,
  36: 44,
  47: 26,
  49: 11,
  51: 67,
  56: 53,
  62: 19,
  64: 60,
  71: 91,
  80: 100,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function movePlayer(playerPosition, diceRoll) {
  let newPosition = playerPosition + diceRoll;

  if (newPosition > boardSize) {
    return playerPosition;
  }

  if (chutesAndLadders.hasOwnProperty(newPosition)) {
    return chutesAndLadders[newPosition];
  }

  return newPosition;
}

  // ... (previous game logic code)

  document.addEventListener("DOMContentLoaded", () => {
    const rollDiceButton = document.getElementById("roll-dice");
    const message = document.getElementById("message");
    let playerPosition = 1;

    function updateBoard() {
      const board = document.getElementById("board");
      board.innerHTML = "";

      for (let i = 1; i <= boardSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (i === playerPosition) {
          cell.textContent = "P";
        }

        board.appendChild(cell);
      }
    }

    rollDiceButton.addEventListener("click", () => {
      const diceRoll = rollDice();
      playerPosition = movePlayer(playerPosition, diceRoll);
      updateBoard();

      if (playerPosition === boardSize) {
        message.textContent = "You won! Congratulations!";
        rollDiceButton.disabled = true;
      } else {
        message.textContent = `You rolled a ${diceRoll}. Your new position is ${playerPosition}.`;
      }
    });

    updateBoard();
  });
