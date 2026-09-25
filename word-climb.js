const DEFAULT_FLOOR_1 = {
  floor: 1,
  letters: "CLEARINGS",
  targetWordLength: 5,
  validWords: ["CLEAR", "CLEAN", "GRAIN", "LEARN", "SIGNAL", "RAILS", "ANGEL", "RINGS"]
};

let currentFloorData = null;
let currentGuess = "";
let activeWheelButtons = [];

async function loadAndPlayFloor(floorNum) {
    if (floorNum > 10) {
        const msgBox = document.getElementById("message-box");
        if (msgBox) {
            msgBox.style.color = "#2ecc71";
            msgBox.innerText = "CLIMB COMPLETE! 11TH FLOOR REACHED!";
        }
        return;
    }

    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentFloorData = await response.json();
        setupGameSession(currentFloorData);
    } catch (error) {
        currentFloorData = { ...DEFAULT_FLOOR_1, floor: floorNum };
        setupGameSession(currentFloorData);
    }
}

function setupGameSession(floorData) {
    currentGuess = "";
    activeWheelButtons = [];
    updateGuessDisplay();
    
    const msgBox = document.getElementById("message-box");
    if (msgBox) msgBox.innerText = "";

    const floorText = document.getElementById("card-floor-text");
    if (floorText) {
        floorText.innerText = `FLOOR ${String(floorData.floor || 1).padStart(2, '0')}`;
    }

    const slotsContainer = document.getElementById("target-word-slots");
    if (slotsContainer) {
        slotsContainer.innerHTML = "";
        const length = floorData.targetWordLength || 5;
        for (let i = 0; i < length; i++) {
            const slot = document.createElement("div");
            slot.className = "target-slot";
            slotsContainer.appendChild(slot);
        }
    }

    const wheelContainer = document.getElementById("wheel-container");
    if (wheelContainer) {
        wheelContainer.innerHTML = "";
        const letters = (floorData.letters || "CLEARINGS").split("");
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
            btn.innerText = char;
            btn.style.position = "absolute";
            btn.style.left = `${x}px`;
            btn.style.top = `${y}px`;
            btn.style.width = "40px";
            btn.style.height = "40px";
            btn.style.borderRadius = "50%";
            btn.style.border = "1px solid #333";
            btn.style.background = "#1c1c1c";
            btn.style.color = "#fff";
            btn.style.fontWeight = "bold";
            btn.style.fontSize = "1rem";
            btn.style.cursor = "pointer";

            btn.addEventListener("click", () => {
                if (currentGuess.length < (floorData.targetWordLength || 5)) {
                    currentGuess += char;
                    btn.style.opacity = "0.3";
                    btn.disabled = true;
                    activeWheelButtons.push(btn);
                    updateGuessDisplay();
                }
            });

            wheelContainer.appendChild(btn);
        });
    }

    const deleteBtn = document.getElementById("action-delete-btn");
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (currentGuess.length > 0) {
                currentGuess = currentGuess.slice(0, -1);
                const lastBtn = activeWheelButtons.pop();
                if (lastBtn) {
                    lastBtn.style.opacity = "1";
                    lastBtn.disabled = false;
                }
                updateGuessDisplay();
            }
        };
    }

    const submitBtn = document.getElementById("action-submit-btn");
    if (submitBtn) {
        submitBtn.onclick = () => {
            checkWordClimbGuess(floorData);
        };
    }
}

function updateGuessDisplay() {
    const display = document.getElementById("guess-display");
    if (!display) return;
    
    display.innerHTML = currentGuess
        .split("")
        .map(c => `<span style="padding:4px 8px; background:#1c1c1c; border:1px solid #ff1f2d; border-radius:4px; font-weight:bold;">${c}</span>`)
        .join("");
}

function checkWordClimbGuess(floorData) {
    const msgBox = document.getElementById("message-box");
    const valids = (floorData.validWords || []).map(w => w.toUpperCase());
    
    if (valids.includes(currentGuess.toUpperCase())) {
        if (msgBox) {
            msgBox.style.color = "#2ecc71";
            msgBox.innerText = "CORRECT!";
        }
        setTimeout(() => {
            loadAndPlayFloor((floorData.floor || 1) + 1);
        }, 800);
    } else {
        if (msgBox) {
            msgBox.style.color = "#ff1f2d";
            msgBox.innerText = "INVALID WORD";
        }
        setTimeout(() => {
            if (msgBox) msgBox.innerText = "";
        }, 1000);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadAndPlayFloor(1);
});
