// ==========================================
// 11TH FLOOR WORD CLIMB - GAME ENGINE (JS)
// ==========================================

let currentFloorData = null;
let foundWords = new Set();
let allValidWords = new Set();
let currentSelection = []; // indices of selected letters on the wheel
let currentWordString = "";

// Initialize game on page load
document.addEventListener("DOMContentLoaded", () => {
    initElevatorSlots();
    loadAndPlayFloor(1); // Start cleanly on Floor 1
});

// Setup click listeners for elevator floor selection
function initElevatorSlots() {
    const slots = document.querySelectorAll(".elevator-slot");
    slots.forEach(slot => {
        slot.addEventListener("click", () => {
            const floorNum = parseInt(slot.getAttribute("data-floor"));
            if (floorNum >= 1 && floorNum <= 11) {
                loadAndPlayFloor(floorNum);
            }
        });
    });
}

// Fetch and load specific floor JSON
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
        showMessage(`Failed to load Floor ${floorNum}.`, "error");
    }
}

// Setup game session with loaded data
function setupGameSession(data) {
    foundWords.clear();
    allValidWords.clear();

    // Flatten valid words into a lookup set
    for (const lengthGroup of Object.values(data.words)) {
        lengthGroup.forEach(word => allValidWords.add(word));
    }

    // Update UI elements
    updateText("card-floor-text", `FLOOR ${String(data.floor).padStart(2, '0')}`);
    updateElevatorActiveState(data.floor);
    showMessage(`Floor ${data.floor} loaded! Find ${allValidWords.size} words.`);

    // Reset word builder
    currentSelection = [];
    currentWordString = "";
    renderGuessDisplay();

    // Render interactive wheel
    renderWheel(data.letters);

    // Setup action buttons
    setupActionButtons();
}

// Highlight the active elevator slot
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

// Render circular letter wheel
function renderWheel(letters) {
    const container = document.getElementById("wheel-container");
    if (!container) return;
    
    container.innerHTML = "";
    const letterArray = letters.split("");
    const radius = 70; // distance from center
    const centerX = container.offsetWidth / 2 || 100;
    const centerY = container.offsetHeight / 2 || 100;

    letterArray.forEach((letter, index) => {
        const angle = (index * 2 * Math.PI) / letterArray.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 20; // 20 is half button width
        const y = centerY + radius * Math.sin(angle) - 20;

        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.className = "wheel-letter-btn";
        btn.style.position = "absolute";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = "40px";
        btn.style.height = "40px";
        btn.style.borderRadius = "50%";
        btn.style.background = "#1c1c1c";
        btn.style.border = "1px solid #ff1f2d";
        btn.style.color = "#ffffff";
        btn.style.fontWeight = "bold";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => {
            currentWordString += letter;
            renderGuessDisplay();
        });

        container.appendChild(btn);
    });
}

// Update guess display letters
function renderGuessDisplay() {
    const display = document.getElementById("guess-display");
    if (!display) return;

    display.innerHTML = "";
    currentWordString.split("").forEach(char => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.padding = "6px 10px";
        span.style.background = "#1c1c1c";
        span.style.border = "1px solid #ff1f2d";
        span.style.borderRadius = "6px";
        span.style.fontWeight = "bold";
        display.appendChild(span);
    });
}

// Setup delete and submit buttons
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

// Validate word submission
function handleSubmission() {
    const word = currentWordString.trim().toUpperCase();
    if (!word) return;

    if (foundWords.has(word)) {
        showMessage(`Already found '${word}'!`, "warning");
    } else if (allValidWords.has(word)) {
        foundWords.add(word);
        showMessage(`EXCELLENT! '${word}' found! (${foundWords.size}/${allValidWords.size})`, "success");
        if (foundWords.size === allValidWords.size) {
            showMessage(`CONGRATULATIONS! Floor ${currentFloorData.floor} Cleared!`, "success");
        }
    } else {
        showMessage(`'${word}' is not valid.`, "error");
    }

    currentWordString = "";
    renderGuessDisplay();
}

// Helpers
updateText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

function showMessage(text) {
    const msg = document.getElementById("message-box");
    if (msg) msg.textContent = text;
}
