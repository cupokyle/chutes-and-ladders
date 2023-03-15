const boardSize = 100;
let turns = 0; // Add this line at the beginning of the script

// Load leaderboard data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadLeaderboardData();
});

// Save leaderboard data to localStorage
function saveLeaderboardData(leaderboardData) {
    // Sort leaderboardData by ascending turns
    leaderboardData.sort((a, b) => a.turns - b.turns);

    // Keep only the top 5 results
    leaderboardData = leaderboardData.slice(0, 5);

    localStorage.setItem("leaderboardData", JSON.stringify(leaderboardData));
}

// Load leaderboard data from localStorage
function loadLeaderboardData() {
    const leaderboardData = JSON.parse(localStorage.getItem("leaderboardData")) || [];
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";

    leaderboardData.forEach(({ name, turns }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${name} - ${turns} turns`;
        leaderboard.appendChild(listItem);
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateChutesAndLadders(minChutesLadders, maxChutesLadders) {
    const chutesAndLadders = {};

    const totalChutesLadders = getRandomInt(minChutesLadders, maxChutesLadders);

    for (let i = 0; i < totalChutesLadders; i++) {
        let startPosition, endPosition;

        do {
            startPosition = getRandomInt(2, boardSize - 1); // Exclude positions 1 and 100
            endPosition = getRandomInt(2, boardSize - 1);

            const isChute = startPosition > endPosition;
            const isLadder = startPosition < endPosition;

            if (isChute) {
                // Chute constraints: start position must be at least 2 steps higher than end position
                if (startPosition - endPosition < 2) continue;
            } else if (isLadder) {
                // Ladder constraints: end position must be at least 2 steps higher than start position
                if (endPosition - startPosition < 2) continue;
            }

        } while (chutesAndLadders.hasOwnProperty(startPosition));

        chutesAndLadders[startPosition] = endPosition;
    }

    return chutesAndLadders;
}

const chutesAndLadders = generateChutesAndLadders(8, 16); // Generate between 8 to 16 chutes and ladders

// ... (rest of the previous code)
function displayChutesAndLadders(board, boardSvg) {
    for (const start in chutesAndLadders) {
        const end = chutesAndLadders[start];
        const startCell = board.children[start - 1];
        const endCell = board.children[end - 1];

        const startX = startCell.offsetLeft + startCell.offsetWidth / 2;
        const startY = startCell.offsetTop + startCell.offsetHeight / 2;
        const endX = endCell.offsetLeft + endCell.offsetWidth / 2;
        const endY = endCell.offsetTop + endCell.offsetHeight / 2;

        const isChute = start > end;

        if (isChute) {
            const controlPoint1X = (startX * 2 + endX) / 3;
            const controlPoint1Y = startY - 50;
            const controlPoint2X = (endX * 2 + startX) / 3;
            const controlPoint2Y = endY - 50;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute(
                "d",
                `M${startX} ${startY} C${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${endX} ${endY}`
            );
            path.setAttribute("stroke", "red");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("fill", "none");
            path.setAttribute("id", `chute-${start}`);
            boardSvg.appendChild(path);
        } else {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);
            line.setAttribute("stroke", "green");
            line.setAttribute("stroke-width", "2");
            boardSvg.appendChild(line);
        }
    }
}




function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function movePlayer(playerPosition, diceRoll) {
    let newPosition = playerPosition + diceRoll;
    let moveType = 'normal';

    if (newPosition >= boardSize) {
        newPosition = boardSize; // Set newPosition to 100
        return { newPosition, moveType };
    }

    if (chutesAndLadders.hasOwnProperty(newPosition)) {
        moveType = newPosition > chutesAndLadders[newPosition] ? 'chute' : 'ladder';
        newPosition = chutesAndLadders[newPosition];
    }

    return { newPosition, moveType };
}


function getPositionCoordinates(position) {
    const row = Math.ceil(position / 10);
    const col = position % 10 === 0 ? 10 : position % 10;
    const x = row % 2 === 0 ? 11 - col : col;
    const y = 11 - row;
    return { x, y };
}

document.addEventListener("DOMContentLoaded", () => {
    const rollDiceButton = document.getElementById("roll-dice");
    const message = document.getElementById("message");
    let playerPosition = 1;

    function updateBoard() {
        const board = document.getElementById("board");
        const boardSvg = document.getElementById("board-svg"); // Add this line
        board.innerHTML = "";
        boardSvg.innerHTML = ""; // Add this line

        for (let i = 1; i <= boardSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = i;

            if (i === playerPosition) {
                const playerImg = document.createElement("img");
                playerImg.src = "./kyle.png"; // Replace with the image URL
                playerImg.classList.add("player-img");
                cell.appendChild(playerImg);
            }

            const { x, y } = getPositionCoordinates(i);
            cell.style.gridColumn = x;
            cell.style.gridRow = y;

            board.appendChild(cell);
        }

        const playerImg = document.querySelector(".player-img");
        const currentCell = board.children[playerPosition - 1];

        displayChutesAndLadders(board, boardSvg); // Move this line outside the loop
    }


    rollDiceButton.addEventListener("click", () => {
        const dice = document.getElementById("dice");
        dice.classList.add("dice-roll-animation");
        rollDiceButton.classList.add("hide"); // Hide the Roll Dice button
        turns++; // Increment turns after rolling the dice

        setTimeout(() => {
            const diceRoll = rollDice();
            dice.textContent = diceRoll;
            dice.classList.remove("dice-roll-animation");
            rollDiceButton.classList.remove("hide"); // Show the Roll Dice button again

            const { newPosition, moveType } = movePlayer(playerPosition, diceRoll);
            playerPosition = newPosition;
            updateBoard();

            const playerElement = document.querySelector(".player-img");

            if (moveType === "chute") {
                playerElement.classList.add("player-chute");
                const chuteLine = document.getElementById(`chute-${playerPosition}`);
                chuteLine.classList.add("chute-line-animation");
            } else if (moveType === "ladder") {
                playerElement.classList.add("player-ladder");
            }

            setTimeout(() => {
                playerElement.classList.remove("player-chute", "player-ladder");
                if (moveType === "chute") {
                    const chuteLine = document.getElementById(`chute-${playerPosition}`);
                    chuteLine.classList.remove("chute-line-animation");
                }
            }, 500);

            if (playerPosition === boardSize) {
                message.textContent = "You won! Congratulations!";
                rollDiceButton.disabled = true;
                showWinningModal(); // Show the modal when the player wins
            } else {
                message.textContent = `You rolled a ${diceRoll}. Your new position is ${playerPosition}.`;
            }
        }, 2000); // Change this value to adjust the duration of the dice roll animation
    });
    function showWinningModal() {
        const winningModal = document.getElementById("winning-modal");
        winningModal.style.display = "block";
    }

    document.getElementById("submit-name").addEventListener("click", () => {
        const playerName = document.getElementById("player-name").value;
        if (!playerName.trim()) return;

        const leaderboardData = JSON.parse(localStorage.getItem("leaderboardData")) || [];
        leaderboardData.push({ name: playerName, turns });

        saveLeaderboardData(leaderboardData);
        loadLeaderboardData();

        document.getElementById("winning-modal").style.display = "none";
    });


    updateBoard();
});

