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
    setupVaultModal();
});

function getOrdinalFloorHTML(floorNum) {
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
    const ord = ordinals[floorNum - 1] || `${floorNum}th`;
    return `<span style="color: var(--accent-red); font-size: 1.25rem; font-weight: 700;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
}

async function fetchFileWithFallbacks(filename) {
    const candidatePaths = [
        `./${filename}`,
        `./archives/${filename}`,
        `./data/${filename}`,
        filename
    ];

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {}
    }
    return null;
}

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

    if (typeof window.fetchDictionary === 'function') {
        const retrySuccess = await window.fetchDictionary();
        if (retrySuccess && window.WORD_LIST && window.WORD_LIST.size > 0) {
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

function setupVaultModal() {
    const statsBtn = document.getElementById("btn-landing-stats");
    const closeBtn = document.getElementById("btn-close-vault");
    const vaultModal = document.getElementById("modal-vault");

    if (statsBtn && vaultModal) {
        statsBtn.addEventListener("click", () => {
            vaultModal.classList.remove("hidden");
            populateVault();
        });
    }

    if (closeBtn && vaultModal) {
        closeBtn.addEventListener("click", () => {
            vaultModal.classList.add("hidden");
        });
    }
}

async function populateVault() {
    const vaultList = document.getElementById("vault-list");
    if (!vaultList) return;

    vaultList.innerHTML = "";
    let archiveId = 1;

    while (true) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox-wc.${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);

        if (!data) break;

        const btn = document.createElement("button");
        btn.className = "vault-item-btn";
        btn.innerHTML = `<strong>Archive ${paddedId}</strong>`;
        btn.onclick = () => {
            loadVaultArchive(paddedId);
        };
        vaultList.appendChild(btn);
        archiveId++;
    }
}

async function loadVaultArchive(paddedId) {
    const filename = `sandbox-wc.${paddedId}.json`;
    const data = await fetchFileWithFallbacks(filename);

    if (data && data.masterWord && data.wheelLetters) {
        await resolveDictionary();

        masterNineLetterWord = data.masterWord.toUpperCase();
        initialDailyWheel = [...data.wheelLetters];
        wheelLetters = [...initialDailyWheel];

        const startScreen = document.getElementById("start-screen");
        const gameWorkspace = document.getElementById("game-workspace");
        const hudContainer = document.getElementById("floor-hud-container");
        const gameControls = document.getElementById("game-controls");
        const vaultModal = document.getElementById("modal-vault");

        if (startScreen) startScreen.style.display = "none";
        if (hudContainer) hudContainer.style.display = "flex";
        if (gameWorkspace) gameWorkspace.style.display = "flex";
        if (gameControls) gameControls.style.display = "flex";
        if (vaultModal) vaultModal.classList.add("hidden");

        startNewGame();
    } else {
        alert(`Could not locate Archive ${paddedId} (sandbox-wc.${paddedId}.json).`);
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

    initDailyPuzzle();
    startNewGame();
}

function initDailyPuzzle() {
    masterNineLetterWord = "COMPLAINT";
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

    const floorVal = document.getElementById("floor-number-val");
    if (floorVal) {
        floorVal.innerHTML = getOrdinalFloorHTML(floor);
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
    const slots = document.querySelectorAll(".tower-floor, .elevator-slot, .floor-block");
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

    const containerWidth = wheelContainer.clientWidth || 295;
    const containerHeight = wheelContainer.clientHeight || 295;

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Increased node button diameter (56px) & radius (98px) to match drawn guidelines
    const btnSize = 56;
    const radius = 98;
    const total = letters.length;

    letters.forEach((char, index) => {
        const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle) - (btnSize / 2);
        const y = centerY + radius * Math.sin(angle) - (btnSize / 2);

        const btn = document.createElement("button");
        btn.className = "wheel-letter-btn";
        btn.textContent = char;
        btn.style.position = "absolute";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = `${btnSize}px`;
        btn.style.height = `${btnSize}px`;
        btn.style.borderRadius = "50%";
        btn.style.border = "1px solid #ff1f2d";
        btn.style.boxShadow = "0 0 10px rgba(255, 31, 45, 0.25)";
        btn.style.background = "#111111";
        btn.style.color = "#ffffff";
        btn.style.fontFamily = "'Montserrat', sans-serif";
        btn.style.fontWeight = "800";
        btn.style.fontSize = "21px"; // Larger, highly visible letters
        btn.style.cursor = "pointer";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";

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

    const shuffleSize = 48;
    const shuffleBtn = document.createElement("button");
    shuffleBtn.id = "shuffle-hub-btn";
    shuffleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #ff1f2d;">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
    `;
    shuffleBtn.style.position = "absolute";
    shuffleBtn.style.left = `${centerX - (shuffleSize / 2)}px`;
    shuffleBtn.style.top = `${centerY - (shuffleSize / 2)}px`;
    shuffleBtn.style.width = `${shuffleSize}px`;
    shuffleBtn.style.height = `${shuffleSize}px`;
    shuffleBtn.style.borderRadius = "50%";
    shuffleBtn.style.background = "#141414";
    shuffleBtn.style.border = "1px solid #222222";
    shuffleBtn.style.boxShadow = "0 0 10px rgba(0,0,0,0.8)";
    shuffleBtn.style.cursor = "pointer";
    shuffleBtn.style.display = "flex";
    shuffleBtn.style.alignItems = "center";
    shuffleBtn.style.justifyContent = "center";
    shuffleBtn.style.zIndex = "10";

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
        .map(c => `<span style="padding: 4px 8px; background: #111111; border: 1px solid #ff1f2d; border-radius: 4px; font-weight: 800; color: #ffffff; font-size: 14px;">${c}</span>`)
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
        showMessage("WRONG WORD! DROPPING TO 1ST FLOOR...", true);

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
            slots[i].style.borderColor = "#22c55e";
            slots[i].style.color = "#22c55e";
            slots[i].style.background = "rgba(34, 197, 94, 0.1)";
        }
    }
}

function handleVictory() {
    const floorVal = document.getElementById("floor-number-val");
    if (floorVal) floorVal.innerHTML = getOrdinalFloorHTML(11);

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
                <div style="color: #22c55e; font-weight: 800; font-size: 1rem; line-height: 1.4; letter-spacing: 0.5px;">
                    Congratulations! You've reached the 11th Floor.
                </div>
                <div style="color: #888888; font-size: 0.8rem; line-height: 1.4; font-weight: 500;">
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
        msg.style.color = isError ? "#ff1f2d" : "#22c55e";
    }
}
