// 11th Floor Word Climb - Daily Game Engine

let currentFloor = 1;
let currentGuess = "";
let isTransitioning = false;
let masterNineLetterWord = "";
let initialDailyWheel = [];
let wheelLetters = [];
let validWordSet = null;

// Timer Variables
let startTime = 0;
let timerInterval = null;
let timeElapsedSeconds = 0;

// Local Storage Player Stats Key
const STATS_KEY = '11th_floor_wordclimb_stats';

document.addEventListener("DOMContentLoaded", () => {
    setupLandingScreen();
    setupVaultModal();
    bindExtraEvents();
    updateStatsDisplay();

    window.addEventListener("resize", () => {
        if (wheelLetters.length > 0) {
            renderWheel(wheelLetters);
        }
    });
});

function getOrdinalFloorHTML(floorNum) {
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
    const ord = ordinals[floorNum - 1] || `${floorNum}th`;
    return `<span style="color: var(--genre-blue, #3B82F6); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
}

// --- Timer Functions ---
function startTimer() {
    stopTimer();
    timeElapsedSeconds = 0;
    startTime = Date.now();
    const activeGameTimer = document.getElementById("active-game-timer");
    if (activeGameTimer) {
        activeGameTimer.style.display = "block";
        activeGameTimer.textContent = "00:00";
    }
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerDisplay() {
    timeElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const activeGameTimer = document.getElementById("active-game-timer");
    if (activeGameTimer) {
        activeGameTimer.textContent = formatTime(timeElapsedSeconds);
    }
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
            const victoryScreen = document.getElementById("victory-screen");
            if (victoryScreen && victoryScreen.style.display !== "none") {
                resetToStartScreen();
            }
        });
    }
}

function bindExtraEvents() {
    const victoryStatsBtn = document.getElementById("btn-victory-stats");
    const statsModal = document.getElementById("modal-vault");

    if (victoryStatsBtn) {
        victoryStatsBtn.addEventListener("click", () => {
            if (statsModal) statsModal.classList.remove("hidden");
            populateVault();
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

function shuffleAndVerifyWheel(letters, masterWord) {
    let arr = [...letters];
    const target = (masterWord || "").toUpperCase();

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    let attempts = 0;
    do {
        shuffle(arr);
        attempts++;
        const currentStr = arr.join("");
        const doubleStr = currentStr + currentStr;
        const matchesClockwise = target.length > 0 && doubleStr.includes(target);

        if (!matchesClockwise || attempts > 50) {
            break;
        }
    } while (true);

    return arr;
}

async function loadVaultArchive(paddedId) {
    const filename = `sandbox-wc.${paddedId}.json`;
    const data = await fetchFileWithFallbacks(filename);

    if (data && data.masterWord && data.wheelLetters) {
        await resolveDictionary();

        masterNineLetterWord = data.masterWord.toUpperCase();
        initialDailyWheel = shuffleAndVerifyWheel(data.wheelLetters, masterNineLetterWord);
        wheelLetters = [...initialDailyWheel];

        const startScreen = document.getElementById("start-screen");
        const victoryScreen = document.getElementById("victory-screen");
        const gameplayHeader = document.getElementById("gameplay-header");
        const gameWorkspace = document.getElementById("game-workspace");
        const hudContainer = document.getElementById("floor-hud-container");
        const gameControls = document.getElementById("game-controls");
        const vaultModal = document.getElementById("modal-vault");
        const footerText = document.getElementById("footer-text");

        if (startScreen) startScreen.style.display = "none";
        if (victoryScreen) victoryScreen.style.display = "none";
        if (gameplayHeader) gameplayHeader.style.display = "flex";
        if (hudContainer) hudContainer.style.display = "flex";
        if (gameWorkspace) gameWorkspace.style.display = "flex";
        if (gameControls) gameControls.style.display = "flex";
        if (vaultModal) vaultModal.classList.add("hidden");
        if (footerText) footerText.style.display = "block";

        startNewGame();
    } else {
        alert(`Could not locate Archive ${paddedId} (sandbox-wc.${paddedId}.json).`);
    }
}

function launchGameWorkspace() {
    const startScreen = document.getElementById("start-screen");
    const victoryScreen = document.getElementById("victory-screen");
    const gameplayHeader = document.getElementById("gameplay-header");
    const gameWorkspace = document.getElementById("game-workspace");
    const hudContainer = document.getElementById("floor-hud-container");
    const gameControls = document.getElementById("game-controls");
    const footerText = document.getElementById("footer-text");

    if (startScreen) startScreen.style.display = "none";
    if (victoryScreen) victoryScreen.style.display = "none";
    if (gameplayHeader) gameplayHeader.style.display = "flex";
    if (hudContainer) hudContainer.style.display = "flex";
    if (gameWorkspace) gameWorkspace.style.display = "flex";
    if (gameControls) gameControls.style.display = "flex";
    if (footerText) footerText.style.display = "block";

    initDailyPuzzle();
    startNewGame();
}

function resetToStartScreen() {
    const victoryScreen = document.getElementById("victory-screen");
    const hudContainer = document.getElementById("floor-hud-container");
    const gameWorkspace = document.getElementById("game-workspace");
    const gameControls = document.getElementById("game-controls");
    const gameplayHeader = document.getElementById("gameplay-header");
    const activeGameTimer = document.getElementById("active-game-timer");
    const startScreen = document.getElementById("start-screen");

    if (victoryScreen) victoryScreen.style.display = "none";
    if (hudContainer) hudContainer.style.display = "none";
    if (gameWorkspace) gameWorkspace.style.display = "none";
    if (gameControls) gameControls.style.display = "none";
    if (gameplayHeader) gameplayHeader.style.display = "none";
    if (activeGameTimer) activeGameTimer.style.display = "none";
    if (startScreen) startScreen.style.display = "flex";
}

function initDailyPuzzle() {
    masterNineLetterWord = "CHARTERED";
    const initialArr = ["R", "E", "C", "A", "T", "D", "H", "E", "R"];
    initialDailyWheel = shuffleAndVerifyWheel(initialArr, masterNineLetterWord);
    wheelLetters = [...initialDailyWheel];
}

function startNewGame() {
    currentFloor = 1;
    currentGuess = "";
    isTransitioning = false;

    wheelLetters = [...initialDailyWheel];

    startTimer();
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

    const reqLen = getRequiredWordLength(floor);
    const ruleText = document.getElementById("floor-rule-text");
    if (ruleText) {
        ruleText.textContent = `${reqLen}-letter English word • No mistakes!`;
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

    const btnSize = Math.round(containerWidth * 0.19);
    const radius = Math.round(containerWidth * 0.332);
    const fontSize = Math.round(btnSize * 0.38);
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
        btn.style.border = "1px solid #FACC15";
        btn.style.boxShadow = "0 0 6px rgba(250, 204, 21, 0.2)";
        btn.style.background = "#111111";
        btn.style.color = "#ffffff";
        btn.style.fontFamily = "'Inter', sans-serif";
        btn.style.fontWeight = "800";
        btn.style.fontSize = `${fontSize}px`;
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

    const shuffleSize = Math.round(btnSize * 0.85);
    const shuffleBtn = document.createElement("button");
    shuffleBtn.id = "shuffle-hub-btn";
    shuffleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 50%; height: 50%; fill: #FACC15;">
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
    shuffleBtn.style.border = "1px solid #FACC15";
    shuffleBtn.style.boxShadow = "0 0 6px rgba(250, 204, 21, 0.25)";
    shuffleBtn.style.cursor = "pointer";
    shuffleBtn.style.display = "flex";
    shuffleBtn.style.alignItems = "center";
    shuffleBtn.style.justifyContent = "center";
    shuffleBtn.style.zIndex = "10";

    shuffleBtn.addEventListener("click", () => {
        if (isTransitioning) return;
        wheelLetters = shuffleAndVerifyWheel(wheelLetters, masterNineLetterWord);
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
        .map(c => `<span style="padding: 4px 8px; background: #111111; border: 1px solid #FACC15; border-radius: 4px; font-weight: 800; color: #ffffff; font-size: 14px; box-shadow: 0 0 6px rgba(250, 204, 21, 0.25);">${c}</span>`)
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
        showMessage("WRONG WORD! DROPPING TO GROUND FLOOR...", true);

        const slotsContainer = document.getElementById("target-word-slots");
        if (slotsContainer) {
            const slots = slotsContainer.querySelectorAll(".target-slot");
            slots.forEach(s => {
                s.style.borderColor = "#EF4444";
                s.style.color = "#FCA5A5";
                s.style.background = "rgba(239, 68, 68, 0.2)";
            });
        }

        stopTimer();
        recordGameResult(false, currentFloor);

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
            slots[i].style.color = "#86EFAC";
            slots[i].style.background = "rgba(34, 197, 94, 0.2)";
        }
    }
}

function handleVictory() {
    stopTimer();
    const newStats = recordGameResult(true, 11);

    const victoryTimeDisplay = document.getElementById("victory-time-display");
    const victoryStreakDisplay = document.getElementById("victory-streak-display");
    const hudContainer = document.getElementById("floor-hud-container");
    const gameWorkspace = document.getElementById("game-workspace");
    const gameControls = document.getElementById("game-controls");
    const gameplayHeader = document.getElementById("gameplay-header");
    const activeGameTimer = document.getElementById("active-game-timer");
    const victoryScreen = document.getElementById("victory-screen");
    const footerText = document.getElementById("footer-text");

    if (victoryTimeDisplay) victoryTimeDisplay.textContent = formatTime(timeElapsedSeconds);
    if (victoryStreakDisplay) victoryStreakDisplay.textContent = `${newStats.streak} Days`;

    if (hudContainer) hudContainer.style.display = "none";
    if (gameWorkspace) gameWorkspace.style.display = "none";
    if (gameControls) gameControls.style.display = "none";
    if (gameplayHeader) gameplayHeader.style.display = "none";
    if (activeGameTimer) activeGameTimer.style.display = "none";
    if (footerText) footerText.style.display = "none";

    if (victoryScreen) victoryScreen.style.display = "flex";
}

function showMessage(text, isError = false) {
    const msg = document.getElementById("message-box");
    if (msg) {
        msg.textContent = text;
        msg.style.color = isError ? "#EF4444" : "#22c55e";
    }
}

// --- Player Stats & Persistence ---
function recordGameResult(isWin, peakFloor) {
    const stats = getStats();
    stats.played++;
    if (isWin) {
        stats.wins++;
        stats.streak++;
    } else {
        stats.streak = 0;
    }

    if (peakFloor > stats.bestFloor) {
        stats.bestFloor = peakFloor;
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    updateStatsDisplay();
    return stats;
}

function getStats() {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
        return { played: 0, wins: 0, streak: 0, bestFloor: 1 };
    }
    return JSON.parse(raw);
}

function updateStatsDisplay() {
    const stats = getStats();
    const playedElem = document.getElementById('stat-played');
    const winsElem = document.getElementById('stat-wins');
    const winrateElem = document.getElementById('stat-winrate');
    const streakElem = document.getElementById('stat-streak');
    const bestfloorElem = document.getElementById('stat-bestfloor');

    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];

    if (playedElem) playedElem.textContent = stats.played;
    if (winsElem) winsElem.textContent = stats.wins;
    
    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    if (winrateElem) winrateElem.textContent = `${winRate}%`;
    if (streakElem) streakElem.textContent = stats.streak;
    
    const bestOrd = ordinals[stats.bestFloor - 1] || `${stats.bestFloor}th`;
    if (bestfloorElem) bestfloorElem.textContent = `${bestOrd} Floor`;
}
