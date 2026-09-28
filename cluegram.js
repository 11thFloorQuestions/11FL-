// 11th Floor Cluegram — Daily Game Engine

let currentFloor = 1;
let currentGuess = [];
let rackLetters = [];
let rackUsedIndices = [];
let isTransitioning = false;
let currentFloorData = null;

document.addEventListener("DOMContentLoaded", () => {
    setupLandingScreen();
    setupVaultModal();
});

function getOrdinalFloorHTML(floorNum) {
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
    const ord = ordinals[floorNum - 1] || `${floorNum}th`;
    return `<span style="color: var(--accent-red); font-size: 1.25rem; font-weight: 700;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
}

function setupLandingScreen() {
    const startBtn = document.getElementById("start-climb-btn");
    if (!startBtn) return;

    startBtn.onclick = () => {
        launchGameWorkspace();
    };
}

function setupVaultModal() {
    const statsBtn = document.getElementById("btn-landing-stats");
    const closeBtn = document.getElementById("btn-close-vault");
    const vaultModal = document.getElementById("modal-vault");

    if (statsBtn && vaultModal) {
        statsBtn.addEventListener("click", () => {
            vaultModal.classList.remove("hidden");
        });
    }

    if (closeBtn && vaultModal) {
        closeBtn.addEventListener("click", () => {
            vaultModal.classList.add("hidden");
        });
    }
}

function launchGameWorkspace() {
    const startScreen = document.getElementById("start-screen");
    const gameWorkspace = document.getElementById("game-workspace");
    const hudContainer = document.getElementById("floor-hud-container");
    const gameControls = document.getElementById("game-controls");

    if (startScreen) startScreen.style.display = "none";
    if (hudContainer) hudContainer.style.display = "flex";
    if (gameWorkspace) gameWorkspace.style.display = "flex";
    if (gameControls) gameControls.style.display = "flex";

    startNewGame();
}

function startNewGame() {
    currentFloor = 1;
    isTransitioning = false;
    setupFloor(currentFloor);
    attachControlHandlers();
}

function setupFloor(floor) {
    if (floor > 10) {
        handleVictory();
        return;
    }

    isTransitioning = false;
    showMessage("");

    currentFloorData = window.CLUEGRAM_DAILY_SET.floors.find(f => f.floor === floor);
    if (!currentFloorData) return;

    rackLetters = currentFloorData.scrambled.toUpperCase().split("");
    currentGuess = new Array(currentFloorData.target.length).fill("");
    rackUsedIndices = [];

    const floorVal = document.getElementById("floor-number-val");
    if (floorVal) {
        floorVal.innerHTML = getOrdinalFloorHTML(floor);
    }

    const ruleText = document.getElementById("floor-rule-text");
    if (ruleText) {
        ruleText.textContent = `${currentFloorData.target.length}-letter Anagram • No mistakes!`;
    }

    const clueElement = document.getElementById("clue-text");
    if (clueElement) {
        clueElement.textContent = currentFloorData.clue;
    }

    updateElevatorShaft(floor);
    renderBoard();
}

function updateElevatorShaft(floor) {
    const slots = document.querySelectorAll(".tower-floor");
    slots.forEach(slot => {
        const f = parseInt(slot.getAttribute("data-floor"), 10);
        if (f === floor) {
            slot.classList.add("active");
            slot.classList.remove("completed");
        } else if (f < floor) {
            slot.classList.remove("active");
            slot.classList.add("completed");
        } else {
            slot.classList.remove("active", "completed");
        }
    });
}

function renderBoard() {
    renderTargetSlots();
    renderLetterRack();
}

function renderTargetSlots() {
    const slotsContainer = document.getElementById("target-word-slots");
    if (!slotsContainer) return;

    slotsContainer.innerHTML = "";
    const targetLen = currentFloorData.target.length;

    for (let i = 0; i < targetLen; i++) {
        const slot = document.createElement("div");
        const char = currentGuess[i] || "";
        slot.className = `target-slot ${char ? 'filled' : ''}`;
        slot.textContent = char;

        slot.addEventListener("click", () => {
            if (isTransitioning || !currentGuess[i]) return;
            removeLetterFromSlot(i);
        });

        slotsContainer.appendChild(slot);
    }
}

function renderLetterRack() {
    const rackContainer = document.getElementById("letter-rack");
    if (!rackContainer) return;

    rackContainer.innerHTML = "";

    rackLetters.forEach((char, index) => {
        const tile = document.createElement("button");
        const isUsed = rackUsedIndices.includes(index);
        tile.className = `rack-tile ${isUsed ? 'used' : ''}`;
        tile.textContent = char;

        tile.addEventListener("click", () => {
            if (isTransitioning || isUsed) return;
            addLetterToFirstEmptySlot(char, index);
        });

        rackContainer.appendChild(tile);
    });
}

function addLetterToFirstEmptySlot(char, rackIndex) {
    const emptyIdx = currentGuess.findIndex(c => c === "");
    if (emptyIdx !== -1) {
        currentGuess[emptyIdx] = char;
        rackUsedIndices.push(rackIndex);
        renderBoard();
    }
}

function removeLetterFromSlot(slotIndex) {
    const charToRemove = currentGuess[slotIndex];
    if (!charToRemove) return;

    const usedIndexPos = rackUsedIndices.findLastIndex(rIdx => rackLetters[rIdx] === charToRemove);

    if (usedIndexPos !== -1) {
        rackUsedIndices.splice(usedIndexPos, 1);
    }

    currentGuess[slotIndex] = "";
    renderBoard();
}

function attachControlHandlers() {
    const clearBtn = document.getElementById("action-clear-btn");
    const shuffleBtn = document.getElementById("action-shuffle-btn");
    const submitBtn = document.getElementById("action-submit-btn");

    if (clearBtn) {
        clearBtn.onclick = () => {
            if (isTransitioning) return;
            currentGuess = new Array(currentFloorData.target.length).fill("");
            rackUsedIndices = [];
            renderBoard();
        };
    }

    if (shuffleBtn) {
        shuffleBtn.onclick = () => {
            if (isTransitioning) return;
            shuffleRack();
        };
    }

    if (submitBtn) {
        submitBtn.onclick = () => {
            if (isTransitioning) return;
            handleSubmission();
        };
    }
}

function shuffleRack() {
    for (let i = rackLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rackLetters[i], rackLetters[j]] = [rackLetters[j], rackLetters[i]];
    }

    currentGuess = new Array(currentFloorData.target.length).fill("");
    rackUsedIndices = [];
    renderBoard();
}

function handleSubmission() {
    const word = currentGuess.join("").toUpperCase();

    if (word.length < currentFloorData.target.length) {
        showMessage(`FILL ALL ${currentFloorData.target.length} SLOTS`, true);
        return;
    }

    if (word === currentFloorData.target.toUpperCase()) {
        isTransitioning = true;
        showMessage("CORRECT ANAGRAM! ASCENDING...", false);
        highlightSlotsSuccess();

        setTimeout(() => {
            currentFloor++;
            if (currentFloor > 10) {
                handleVictory();
            } else {
                setupFloor(currentFloor);
            }
        }, 1000);
    } else {
        isTransitioning = true;
        showMessage("INCORRECT! DROPPING TO 1ST FLOOR...", true);

        setTimeout(() => {
            startNewGame();
        }, 1400);
    }
}

function highlightSlotsSuccess() {
    const slots = document.querySelectorAll(".target-slot");
    slots.forEach(slot => {
        slot.style.borderColor = "#22c55e";
        slot.style.color = "#22c55e";
        slot.style.background = "rgba(34, 197, 94, 0.1)";
    });
}

function handleVictory() {
    const floorVal = document.getElementById("floor-number-val");
    if (floorVal) floorVal.innerHTML = getOrdinalFloorHTML(11);

    const ruleText = document.getElementById("floor-rule-text");
    if (ruleText) ruleText.textContent = "VICTORY ACHIEVED!";

    updateElevatorShaft(11);

    const messageBox = document.getElementById("message-box");
    if (messageBox) messageBox.textContent = "";

    const playCard = document.getElementById("game-workspace");
    if (playCard) {
        playCard.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 30px 10px; text-align: center; gap: 14px;">
                <div style="font-size: 2.5rem;">🏆</div>
                <div style="color: #22c55e; font-weight: 800; font-size: 1.1rem; line-height: 1.4; letter-spacing: 0.5px;">
                    Congratulations! You've reached the 11th Floor.
                </div>
                <div style="color: #888888; font-size: 0.85rem; line-height: 1.4; font-weight: 500;">
                    Come back tomorrow to tackle a new Cluegram set and extend your streak.
                </div>
            </div>
        `;
    }
}

function showMessage(text, isError = false) {
    const msg = document.getElementById("message-box");
    if (msg) {
        msg.textContent = text;
        msg.style.color = isError ? "#ff1f2d" : "#22c55e";
    }
}
