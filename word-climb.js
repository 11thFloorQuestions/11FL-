// ==========================================
// 11TH FLOOR WORD CLIMB - GAME ENGINE (JS)
// ==========================================

let currentFloorData = null;
let foundWords = new Set();
let allValidWords = new Set();
let currentWordString = "";

// Permanent, immutable letter pool that never changes across any floor
const MASTER_LETTERS = "AEGINRSTL"; 

document.addEventListener("DOMContentLoaded", () => {
    initElevatorSlots();
    loadAndPlayFloor(1);
});

function initElevatorSlots() {
    document.querySelectorAll(".elevator-slot").forEach(slot => {
        slot.addEventListener("click", () => {
            const floorNum = parseInt(slot.getAttribute("data-floor"));
            if (floorNum >= 1 && floorNum <= 11) {
                loadAndPlayFloor(floorNum);
            }
        });
    });
}

async function loadAndPlayFloor(floorNum) {
    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentFloorData = await response.json();
        setupGameSession(currentFloorData);
    } catch (error) {
        console.error("Failed to load floor:", error);
        showMessage(`Failed to load Floor ${floorNum}.`, true);
    }
}

function getRequiredWordLength(floorNum) {
    if (floorNum >= 1 && floorNum <= 3) return 5;
    if (floorNum >= 4 && floorNum <= 6) return 6;
    if (floorNum >= 7 && floorNum <= 8) return 7;
    if (floorNum === 9) return 8;
    if (floorNum === 10) return 9;
    if (floorNum === 11) return 10;
    return 5;
}

function setupGameSession(data) {
    foundWords.clear();
    allValidWords.clear();

    if (data.words) {
        for (const lengthGroup of Object.values(data.words)) {
            lengthGroup.forEach(word => allValidWords.add(word));
        }
    }

    updateText("card-floor-text", `FLOOR ${String(data.floor).padStart(2, '0')}`);
    updateElevatorActiveState(data.floor);
    showMessage("");

    currentWordString = "";
    renderGuessDisplay();
    renderTargetSlots(data.floor);
    renderWheel(MASTER_LETTERS); // Always use the permanent master pool
    setupActionButtons();
}

function updateElevatorActiveState(activeFloor) {
    document.querySelectorAll(".elevator-slot").forEach(slot => {
        const floor = parseInt(slot.getAttribute("data-floor"));
        if (floor === activeFloor) {
            slot.classList.add("active");
        } else {
            slot.classList.remove("active");
        }
    });
}

function renderTargetSlots(floorNum) {
    const container = document.getElementById("target-word-slots");
    if (!container) return;

    container.innerHTML = "";
    const targetLength = getRequiredWordLength(floorNum);
    
    for (let i = 0; i < targetLength; i++) {
        const slot = document.createElement("div");
        slot.className = "target-slot";
        slot.id = `target-slot-${i}`;
        slot.textContent = "";
        container.appendChild(slot);
    }
}

function displaySolvedWordInSlots(word) {
    const container = document.getElementById("target-word-slots");
    if (!container) return;

    container.innerHTML = "";
    for (let i = 0; i < word.length; i++) {
        const slot = document.createElement("div");
        slot.className = "target-slot revealed";
        slot.textContent = word[i];
        container.appendChild(slot);
    }
}

function renderWheel(letters) {
    const container = document.getElementById("wheel-container");
    if (!container) return;
    
    container.innerHTML = "";
    const letterArray = letters.split("");
    const radius = 52; 
    const centerX = container.offsetWidth / 2 || 80;
    const centerY = container.offsetHeight / 2 || 80;

    letterArray.forEach((letter, index) => {
        const angle = (index * 2 * Math.PI) / letterArray.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 16;
        const y = centerY + radius * Math.sin(angle) - 16;

        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.style.position = "absolute";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = "32px";
        btn.style.height = "32px";
        btn.style.borderRadius = "50%";
        btn.style.background = "#1c1c1c";
        btn.style.border = "1px solid #ff1f2d";
        btn.style.color = "#ffffff";
        btn.style.fontWeight = "bold";
        btn.style.cursor = "pointer";

        // Free reuse of letters without disabling them
        btn.addEventListener("click", () => {
            currentWordString += letter;
            renderGuessDisplay();
        });

        container.appendChild(btn);
    });
}

function renderGuessDisplay() {
    const display = document.getElementById("guess-display");
    if (!display) return;

    display.innerHTML = "";
    currentWordString.split("").forEach(char => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.padding = "4px 8px";
        span.style.background = "#1c1c1c";
        span.style.border = "1px solid #ff1f2d";
        span.style.borderRadius = "4px";
        span.style.fontWeight = "bold";
        display.appendChild(span);
    });
}

function setupActionButtons() {
    const deleteBtn = document.getElementById("action-delete-btn");
    const submitBtn = document.getElementById("action-submit-btn");

    if (deleteBtn) {
        const newDel = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDel, deleteBtn);
        newDel.addEventListener("click", () => {
            currentWordString = currentWordString.slice(0, -1);
            renderGuessDisplay();
        });
    }

    if (submitBtn) {
        const newSub = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSub, submitBtn);
        newSub.addEventListener("click", () => handleSubmission());
    }
}

function handleSubmission() {
    const word = currentWordString.trim().toUpperCase();
    if (!word) return;

    const requiredLength = getRequiredWordLength(currentFloorData.floor);

    if (word.length !== requiredLength) {
        showMessage(`Must be ${requiredLength} letters!`, true);
        currentWordString = "";
        renderGuessDisplay();
        return;
    }

    if (foundWords.has(word)) {
        showMessage(`Already found '${word}'!`, true);
        currentWordString = "";
        renderGuessDisplay();
        return;
    }

    // Validate that letters come from the permanent master wheel pool
    const availableLetters = MASTER_LETTERS.toUpperCase();
    let isValidFromWheel = true;
    for (let char of word) {
        if (!availableLetters.includes(char)) {
            isValidFromWheel = false;
            break;
        }
    }

    if (isValidFromWheel) {
        foundWords.add(word);
        showMessage(`Correct! '${word}'`, false);
        displaySolvedWordInSlots(word);

        // Immediate floor progression
        setTimeout(() => {
            const nextFloor = Math.min(currentFloorData.floor + 1, 11);
            loadAndPlayFloor(nextFloor);
        }, 1200);
    } else {
        showMessage(`'${word}' uses invalid letters.`, true);
    }

    currentWordString = "";
    renderGuessDisplay();
}

function updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showMessage(text, isError = false) {
    const msg = document.getElementById("message-box");
    if (msg) {
        msg.textContent = text;
        msg.style.color = isError ? "#ff1f2d" : "#2ecc71";
    }
}
