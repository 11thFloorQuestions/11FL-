// 11th Floor Word Climb - Daily Game Engine

let currentFloor = 1;
let currentGuess = "";
let isTransitioning = false;
let masterNineLetterWord = "";
let initialDailyWheel = [];
let wheelLetters = [];
let validWordSet = null;

document.addEventListener("DOMContentLoaded", () => {
    setupLandingScreen();
});

async function resolveDictionary() {
    if (window.WORD_LIST_LOADED && window.WORD_LIST && window.WORD_LIST.size > 0) {
        validWordSet = window.WORD_LIST;
        return true;
    }

    if (window.WORD_LIST_PROMISE) {
        const success = await window.WORD_LIST_PROMISE;
        if (success && window.WORD_LIST && window.WORD_LIST.size > 0) {
            validWordSet = window.WORD_LIST;
            return true;
        }
    }

    return false;
}

function setupLandingScreen() {
    const startBtn = document.getElementById("start-climb-btn");
    if (!startBtn) return;

    startBtn.onclick = async () => {
        startBtn.textContent = "Loading...";
        startBtn.style.opacity = "0.7";
        startBtn.disabled = true;

        const success = await resolveDictionary();

        if (success && validWordSet && validWordSet.size > 0) {
            launchGameWorkspace();
        } else {
            startBtn.textContent = "Tap to Retry";
            startBtn.style.opacity = "1";
            startBtn.disabled = false;
        }
    };
}

function launchGameWorkspace() {
    const startScreen = document.getElementById("start-screen");
    const gameWorkspace = document.getElementById("game-workspace");
    const gameControls = document.getElementById("game-controls");

    if (startScreen) startScreen.style.display = "none";
    if (gameWorkspace) gameWorkspace.style.display = "flex";
    if (gameControls) gameControls.style.display = "flex";

    initDailyPuzzle();
    startNewGame();
}

// Deterministic daily puzzle selection based on date
function initDailyPuzzle() {
    let nineLetterWords = [];
    if (validWordSet && validWordSet.size > 0) {
        validWordSet.forEach(word => {
            if (word.length === 9) {
                nineLetterWords.push(word);
            }
        });
    }

    nineLetterWords.sort();

    if (nineLetterWords.length > 0) {
        const dayOfYear = getDayOfYear();
        masterNineLetterWord = nineLetterWords[dayOfYear % nineLetterWords.length];
    } else {
        masterNineLetterWord = "CLEARINGS";
    }

    initialDailyWheel = seededShuffle(masterNineLetterWord.split(""), getDayOfYear());
    wheelLetters = [...initialDailyWheel];
}

function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function seededShuffle(array, seed) {
    let m = array.length, t, i;
    while (m) {
        seed = (seed * 9301 + 49297) % 233280;
        i = Math.floor((seed / 233280) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function startNewGame() {
    currentFloor = 1;
    currentGuess = "";
    isTransitioning = false;

    wheelLetters = [...initialDailyWheel];

    setupFloor(currentFloor);
    attachControlHandlers();
}

function setupFloor(floor) {
    if (floor > 10) {
        handleVictory();
        return;
    }

    currentGuess = "";
    isTransitioning = false;
    showMessage("");

    const floorText = document.getElementById("card-floor-text");
    if (floorText) {
        const formatted = floor < 10 ? `0${floor}` : `${floor}`;
        floorText.textContent = `FLOOR ${formatted}`;
    }

    updateElevatorShaft(floor);
    renderTargetSlots(floor);
    renderWheel(wheelLetters);
    updateGuessDisplay();
}

function getRequiredWordLength(floor) {
    if (floor >= 1 && floor <= 3) return 5;
    if (floor >= 4 && floor <= 6) return 6;
    if (floor >= 7 && floor <= 8) return 7;
    if (floor === 9) return 8;
    if (floor === 10) return 9;
    return 5;
}

function updateElevatorShaft(floor) {
    const slots = document.querySelectorAll(".elevator-slot, .floor-block");
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

function renderTargetSlots(floor) {
    const slotsContainer = document.getElementById("target-word-slots");
    if (!slotsContainer) return;

    slotsContainer.innerHTML = "";
    const targetLen = getRequiredWordLength(floor);

    for (let i = 0; i < targetLen; i++) {
        const slot = document.createElement("div");
        slot.className = "target-slot";
        slotsContainer.appendChild(slot);
    }
}

function renderWheel(letters) {
    const wheelContainer = document.getElementById("wheel-container");
    if (!wheelContainer) return;

    wheelContainer.innerHTML = "";
    const radius = 66;
    const centerX = 90;
    const centerY = 90;
    const total = letters.length;

    letters.forEach((char, index) => {
        const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle) - 20;
        const y = centerY + radius * Math.sin(angle) - 20;

        const btn = document.createElement("button");
        btn.className = "wheel-letter-btn";
        btn.textContent = char;
        btn.style.position = "absolute";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = "40px";
        btn.style.height = "40px";
        btn.style.borderRadius = "50%";
        btn.style.border = "1px solid #ff1f2d";
        btn.style.boxShadow = "0 0 5px rgba(255, 31, 45, 0.3)";
        btn.style.background = "#181818";
        btn.style.color = "#ffffff";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "15px";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => {
            if (isTransitioning) return;
            const reqLen = getRequiredWordLength(currentFloor);
            if (currentGuess.length < reqLen) {
                currentGuess += char;
                updateGuessDisplay();
            }
        });

        wheelContainer.appendChild(btn);
    });

    const shuffleBtn = document.createElement("button");
    shuffleBtn.id = "shuffle-hub-btn";
    shuffleBtn.innerHTML = "🔀";
    shuffleBtn.style.position = "absolute";
    shuffleBtn.style.left = "66px";
    shuffleBtn.style.top = "66px";
    shuffleBtn.style.width = "48px";
    shuffleBtn.style.height = "48px";
    shuffleBtn.style.borderRadius = "50%";
    shuffleBtn.style.border = "1px solid #ff1f2d";
    shuffleBtn.style.boxShadow = "0 0 6px rgba(255, 31, 45, 0.4)";
    shuffleBtn.style.backgroundColor = "#121212";
    shuffleBtn.style.color = "#ffffff";
    shuffleBtn.style.fontSize = "18px";
    shuffleBtn.style.cursor = "pointer";
    shuffleBtn.style.display = "flex";
    shuffleBtn.style.alignItems = "center";
    shuffleBtn.style.justifyContent = "center";

    shuffleBtn.addEventListener("click", () => {
        if (isTransitioning) return;
        wheelLetters.sort(() => Math.random() - 0.5);
        renderWheel(wheelLetters);
    });

    wheelContainer.appendChild(shuffleBtn);
}

function attachControlHandlers() {
    const deleteBtn = document.getElementById("action-delete-btn");
    const submitBtn = document.getElementById("action-submit-btn");

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (isTransitioning) return;
            if (currentGuess.length > 0) {
                currentGuess = currentGuess.slice(0, -1);
                updateGuessDisplay();
            }
        };
    }

    if (submitBtn) {
        submitBtn.onclick = () => {
            if (isTransitioning) return;
            handleSubmission();
        };
    }
}

function updateGuessDisplay() {
    const display = document.getElementById("guess-display");
    if (!display) return;

    display.innerHTML = currentGuess
        .split("")
        .map(c => `<span style="padding: 3px 7px; background: #1c1c1c; border: 1px solid #ff1f2d; border-radius: 4px; font-weight: bold; color: #ffffff; font-size: 13px;">${c}</span>`)
        .join("");
}

function handleSubmission() {
    const targetLen = getRequiredWordLength(currentFloor);

    if (currentGuess.length < targetLen) {
        showMessage(`NEED A ${targetLen}-LETTER WORD`, true);
        return;
    }

    const word = currentGuess.toUpperCase();

    const isValid = validWordSet && validWordSet.has(word);

    if (isValid) {
        isTransitioning = true;
        showMessage("VALID WORD! ASCENDING...", false);
        fillTargetSlots(word);

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
        showMessage("WRONG WORD! DROPPING TO FLOOR 01...", true);

        setTimeout(() => {
            startNewGame();
        }, 1400);
    }
}

function fillTargetSlots(word) {
    const slotsContainer = document.getElementById("target-word-slots");
    if (!slotsContainer) return;

    const slots = slotsContainer.querySelectorAll(".target-slot");
    for (let i = 0; i < word.length; i++) {
        if (slots[i]) {
            slots[i].textContent = word[i];
            slots[i].style.borderColor = "#2ecc71";
            slots[i].style.color = "#2ecc71";
            slots[i].style.background = "#122218";
        }
    }
}

function handleVictory() {
    const floorText = document.getElementById("card-floor-text");
    if (floorText) floorText.textContent = "11TH FLOOR";

    updateElevatorShaft(11);

    const messageBox = document.getElementById("message-box");
    if (messageBox) messageBox.textContent = "";

    const guessDisplay = document.getElementById("guess-display");
    if (guessDisplay) guessDisplay.innerHTML = "";

    const wheelContainer = document.getElementById("wheel-container");
    if (wheelContainer) wheelContainer.innerHTML = "";

    const slotsContainer = document.getElementById("target-word-slots");
    if (slotsContainer) {
        slotsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px 10px; text-align: center; gap: 12px;">
                <div style="font-size: 2rem;">🏆</div>
                <div style="color: #2ecc71; font-weight: 800; font-size: 1rem; line-height: 1.4; letter-spacing: 0.5px;">
                    Congratulations! You've reached the 11th Floor.
                </div>
                <div style="color: #aaaaaa; font-size: 0.8rem; line-height: 1.4; font-weight: 500;">
                    Come back tomorrow to continue your streak.
                </div>
            </div>
        `;
    }
}

function showMessage(text, isError = false) {
    const msg = document.getElementById("message-box");
    if (msg) {
        msg.textContent = text;
        msg.style.color = isError ? "#ff1f2d" : "#2ecc71";
    }
}
