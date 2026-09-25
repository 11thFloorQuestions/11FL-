// 11th Floor Word Climb - Game Engine

let currentFloor = 1;
let currentGuess = "";
let isTransitioning = false;
let masterNineLetterWord = "";
let wheelLetters = [];

function getRequiredWordLength(floor) {
    if (floor >= 1 && floor <= 3) return 5;
    if (floor >= 4 && floor <= 6) return 6;
    if (floor >= 7 && floor <= 8) return 7;
    if (floor === 9) return 8;
    if (floor === 10) return 9;
    return 5;
}

document.addEventListener("DOMContentLoaded", () => {
    initGameWithLoadedDictionary();
});

function initGameWithLoadedDictionary() {
    showMessage("LOADING DICTIONARY...", false);

    let checkCount = 0;
    const interval = setInterval(() => {
        checkCount++;
        if (window.WORD_LIST_LOADED && window.WORD_LIST && window.WORD_LIST.size > 0) {
            clearInterval(interval);
            startNewGame();
        } else if (checkCount > 50) {
            clearInterval(interval);
            startNewGame();
        }
    }, 100);
}

function startNewGame() {
    currentFloor = 1;
    currentGuess = "";
    isTransitioning = false;

    selectMasterNineLetterWord();
    setupFloor(currentFloor);
    attachControlHandlers();
}

function selectMasterNineLetterWord() {
    let nineLetterWords = [];
    if (window.WORD_LIST && window.WORD_LIST.size > 0) {
        window.WORD_LIST.forEach(word => {
            if (word.length === 9) {
                nineLetterWords.push(word);
            }
        });
    }

    if (nineLetterWords.length > 0) {
        masterNineLetterWord = nineLetterWords[Math.floor(Math.random() * nineLetterWords.length)];
    } else {
        masterNineLetterWord = "CLEARINGS";
    }

    wheelLetters = masterNineLetterWord.split("").sort(() => Math.random() - 0.5);
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
    const radius = 78; // Proportionate radius inside 210px container
    const centerX = 105;
    const centerY = 105;
    const total = letters.length;

    letters.forEach((char, index) => {
        const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle) - 22;
        const y = centerY + radius * Math.sin(angle) - 22;

        const btn = document.createElement("button");
        btn.className = "wheel-letter-btn";
        btn.textContent = char;
        btn.style.position = "absolute";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = "44px";
        btn.style.height = "44px";
        btn.style.borderRadius = "50%";
        btn.style.border = "1px solid #ff1f2d";
        btn.style.boxShadow = "0 0 5px rgba(255, 31, 45, 0.3)";
        btn.style.background = "#181818";
        btn.style.color = "#ffffff";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "16px";
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

    const centerHub = document.createElement("div");
    centerHub.style.position = "absolute";
    centerHub.style.left = "83px";
    centerHub.style.top = "83px";
    centerHub.style.width = "44px";
    centerHub.style.height = "44px";
    centerHub.style.borderRadius = "50%";
    centerHub.style.border = "1px solid #ff1f2d";
    centerHub.style.backgroundColor = "#0e0e0e";
    wheelContainer.appendChild(centerHub);
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
        .map(c => `<span style="padding: 4px 8px; background: #1c1c1c; border: 1px solid #ff1f2d; border-radius: 4px; font-weight: bold; color: #ffffff;">${c}</span>`)
        .join("");
}

function handleSubmission() {
    const targetLen = getRequiredWordLength(currentFloor);

    if (currentGuess.length < targetLen) {
        showMessage(`NEED A ${targetLen}-LETTER WORD`, true);
        return;
    }

    const word = currentGuess.toUpperCase();

    let isValid = false;
    if (window.WORD_LIST && window.WORD_LIST.size > 0) {
        isValid = window.WORD_LIST.has(word);
    } else {
        isValid = word.length === targetLen;
    }

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
        // Single-Mistake Rule: Drops back to Floor 1 on wrong submission
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

    // Balanced Victory Layout matching the Questions game
    const slotsContainer = document.getElementById("target-word-slots");
    if (slotsContainer) {
        slotsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 24px 12px; text-align: center; gap: 14px;">
                <div style="font-size: 2.2rem;">🏆</div>
                <div style="color: #2ecc71; font-weight: 800; font-size: 1.05rem; line-height: 1.4; letter-spacing: 0.5px;">
                    Congratulations! You've reached the 11th Floor.
                </div>
                <div style="color: #aaaaaa; font-size: 0.85rem; line-height: 1.4; font-weight: 500;">
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
