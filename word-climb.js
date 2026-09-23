// ==========================================
// 11TH FLOOR WORD CLIMB - GAME ENGINE (JS)
// ==========================================

let currentFloorData = null;
let foundWords = new Set();
let allValidWords = new Set();

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    setupMenuListeners();
});

// Setup listeners for floor selection menu
function setupMenuListeners() {
    const floorButtons = document.querySelectorAll(".floor-btn, [data-floor]");
    
    // If your HTML uses menu buttons or cards for floors 1-11
    floorButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const floorNum = parseInt(e.target.getAttribute("data-floor") || e.target.textContent);
            if (floorNum >= 1 && floorNum <= 11) {
                loadAndPlayFloor(floorNum);
            }
        });
    });

    // Auto-load Floor 1 if a direct floor container exists on the page
    const gameContainer = document.getElementById("game-container");
    if (gameContainer && gameContainer.dataset.autoLoadFloor) {
        loadAndPlayFloor(parseInt(gameContainer.dataset.autoLoadFloor));
    }
}

// Fetch and load the specific floor JSON from the correct folder path
async function loadAndPlayFloor(floorNum) {
    // Format floor number with leading zero: 1 -> "01", 11 -> "11"
    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        console.log(`Loading floor from: ${filePath}`);
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        currentFloorData = await response.json();
        initializeGameSession(currentFloorData);

    } catch (error) {
        console.error("Failed to load floor:", error);
        alert(`Failed to load floor ${floorNum}. Please check that ${filePath} exists in your repository.`);
    }
}

// Set up the game board with the loaded JSON data
function initializeGameSession(data) {
    foundWords.clear();
    allValidWords.clear();

    // Compile all valid words across lengths into a single lookup set
    for (const lengthGroup of Object.values(data.words)) {
        lengthGroup.forEach(word => allValidWords.add(word));
    }

    // Update UI elements if they exist in your HTML
    updateUIElement("floor-title", `Floor ${data.floor} of 11`);
    updateUIElement("letter-bank", data.letters.split("").join(" "));
    updateUIElement("total-words-count", data.total_words);
    updateUIElement("found-words-count", "0");

    // Display word slots/banks by length if elements exist
    renderWordBanks(data.words);

    // Setup input submission listener if input box exists
    const submitBtn = document.getElementById("submit-word-btn");
    const wordInput = document.getElementById("word-input");

    if (submitBtn && wordInput) {
        // Clear previous event listeners by cloning
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

        newSubmitBtn.addEventListener("click", () => handleWordSubmission(wordInput));
        wordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleWordSubmission(wordInput);
            }
        });
    }

    // Switch view to game board if using view toggles
    showGameScreen();
}

// Handle user word submission logic
function handleWordSubmission(inputElement) {
    const word = inputElement.value.trim().toUpperCase();
    inputElement.value = "";

    if (!word) return;

    if (word === "MENU") {
        returnToMenu();
        return;
    }

    const messageEl = document.getElementById("game-message");

    if (foundWords.has(word)) {
        showFeedback(`-> Already found '${word}'!`, "warning");
        return;
    }

    if (allValidWords.has(word)) {
        foundWords.add(word);
        updateUIElement("found-words-count", foundWords.size);
        revealWordOnBoard(word);
        
        if (foundWords.size === allValidWords.size) {
            showFeedback(`CONGRATULATIONS! You cleared Floor ${currentFloorData.floor}!`, "success");
        } else {
            showFeedback(`-> EXCELLENT! '${word}' is correct.`, "success");
        }
    } else {
        showFeedback(`-> '${word}' is not a valid word for this board.`, "error");
    }
}

// UI Helper: Update text content safely
function updateUIElement(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// UI Helper: Show feedback messages
function showFeedback(message, type) {
    const msgEl = document.getElementById("game-message");
    if (msgEl) {
        msgEl.textContent = message;
        msgEl.className = `game-message ${type}`;
    }
}

// UI Helper: Render word bank placeholders
function renderWordBanks(wordsByLength) {
    const container = document.getElementById("word-banks-container");
    if (!container) return;

    container.innerHTML = "";
    for (const [length, words] of Object.entries(wordsByLength)) {
        if (words.length === 0) continue;
        
        const groupDiv = document.createElement("div");
        groupDiv.className = `word-group length-${length}`;
        groupDiv.innerHTML = `<h3>${length} Letters (${words.length})</h3><div class="word-slots" id="slots-${length}"></div>`;
        container.appendChild(groupDiv);

        const slotsContainer = groupDiv.querySelector(`#slots-${length}`);
        words.forEach(word => {
            const span = document.createElement("span");
            span.className = "word-slot hidden-word";
            span.id = `word-${word}`;
            span.textContent = "_ ".repeat(word.length);
            slotsContainer.appendChild(span);
        });
    }
}

// Reveal successfully guessed word on the board
function revealWordOnBoard(word) {
    const wordEl = document.getElementById(`word-${word}`);
    if (wordEl) {
        wordEl.textContent = word;
        wordEl.className = "word-slot revealed-word";
    }
}

function showGameScreen() {
    const menu = document.getElementById("menu-screen");
    const game = document.getElementById("game-screen");
    if (menu) menu.style.display = "none";
    if (game) game.style.display = "block";
}

function returnToMenu() {
    const menu = document.getElementById("menu-screen");
    const game = document.getElementById("game-screen");
    if (menu) menu.style.display = "block";
    if (game) game.style.display = "none";
}
