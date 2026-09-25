// 11th Floor Word Climb - Final Game Logic

let currentFloor = 1;
let currentGuess = "";
let isTransitioning = false;
const dictionary = new Set();

// Versatile letter pool capable of forming multi-length words
const MASTER_LETTERS = ["A", "C", "E", "G", "I", "L", "N", "R", "S", "T"];

// Floor-by-floor required word length rules
function getRequiredWordLength(floor) {
    if (floor >= 1 && floor <= 3) return 5;
    if (floor >= 4 && floor <= 6) return 6;
    if (floor >= 7 && floor <= 8) return 7;
    if (floor === 9) return 8;
    if (floor === 10) return 9;
    return 5;
}

document.addEventListener("DOMContentLoaded", () => {
    loadDictionaryAndInit();
});

async function loadDictionaryAndInit() {
    showMessage("LOADING DICTIONARY...", false);
    
    try {
        const response = await fetch("words.js");
        if (response.ok) {
            const text = await response.text();
            const lines = text.split(/\r?\n/);
            lines.forEach(line => {
                const cleaned = line.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();
                if (cleaned.length >= 4) {
                    dictionary.add(cleaned);
                }
            });
        }
    } catch (err) {
        console.warn("External dictionary fallback mode active.");
    }

    initGame();
}

function initGame() {
    currentFloor = 1;
    currentGuess = "";
    isTransitioning = false;
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

    // Update Floor Indicator Text
    const floorText = document.getElementById("card-floor-text");
    if (floorText) {
        const formatted = floor < 10 ? `0${floor}` : `${floor}`;
        floorText.textContent = `FLOOR ${formatted}`;
    }

    // Update Elevator Shaft Graphic
    updateElevatorShaft(floor);

    // Render Target Slots for Required Word Length
    renderTargetSlots(floor);

    // Render Letter Wheel
    renderWheel(MASTER_LETTERS);

    // Update Guess Display Box
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
        slot.style.width = "26px";
        slot.style.height = "30px";
        slot.style.border = "1px solid #333333";
        slot.style.borderRadius = "4px";
        slot.style.background = "#181818";
        slot.style.display = "flex";
        slot.style.alignItems = "center";
        slot.style.justifyContent = "center";
        slot.style.fontWeight = "bold";
        slot.style.fontSize = "14px";
        slot.style.color = "#ffffff";
        slotsContainer.appendChild(slot);
    }
}

function renderWheel(letters) {
    const wheelContainer = document.getElementById("wheel-container");
    if (!wheelContainer) return;

    wheelContainer.innerHTML = "";
    const radius = 65;
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
        btn.style.fontSize = "16px";
        btn.style.cursor = "pointer";

        // Reusable letter logic: No button disabling or fading on tap
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

    // Center decorative hub
    const centerHub = document.createElement("div");
    centerHub.style.position = "absolute";
    centerHub.style.left = "70px";
    centerHub.style.top = "70px";
    centerHub.style.width = "40px";
    centerHub.style.height = "40px";
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

    // Word validation
    let isValid = true;
    if (dictionary.size > 0) {
        isValid = dictionary.has(word);
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
        showMessage("NOT IN WORD LIST", true);
        setTimeout(() => {
            currentGuess = "";
            updateGuessDisplay();
            showMessage("");
        }, 1200);
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
    showMessage("PENTHOUSE REACHED! YOU WIN! 🏆", false);

    const wheelContainer = document.getElementById("wheel-container");
    if (wheelContainer) wheelContainer.innerHTML = "";

    const slotsContainer = document.getElementById("target-word-slots");
    if (slotsContainer) {
        slotsContainer.innerHTML = `<div style="color: #2ecc71; font-weight: bold; font-size: 1rem; text-align: center;">DESTINATION REACHED</div>`;
    }
}

function showMessage(text, isError = false) {
    const msg = document.getElementById("message-box");
    if (msg) {
        msg.textContent = text;
        msg.style.color = isError ? "#ff1f2d" : "#2ecc71";
    }
}
