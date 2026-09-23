// 11th Floor Word Climb - Game Engine

let currentFloor = 1;
const maxFloor = 11;
let currentGuess = [];
let isTransitioning = false;
let currentFloorData = null;

// Active puzzle data updated per floor
const DAILY_PUZZLE = {
    letters: []
};

// Valid words for the current floor loaded from JSON
let activeFloorWords = new Set();

document.addEventListener('DOMContentLoaded', () => {
    loadFloorData(currentFloor);
});

async function loadFloorData(floorNum) {
    showMessage(`LOADING FLOOR ${floorNum}...`, 'info');
    
    // Format floor number with a leading zero (e.g., floor_01.json, floor_02.json)
    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        currentFloorData = await response.json();
        
        // Update letters for the wheel from the JSON file
        DAILY_PUZZLE.letters = currentFloorData.letters || [];
        
        // Build a set of all valid words across all lengths for this floor
        activeFloorWords.clear();
        if (currentFloorData.words) {
            Object.values(currentFloorData.words).forEach(wordList => {
                wordList.forEach(word => activeFloorWords.add(word.toUpperCase()));
            });
        }

        console.log(`[11th Floor] Floor ${floorNum} loaded. Target words: ${activeFloorWords.size}`);
        initGameUI();

    } catch (err) {
        console.error('[11th Floor] Failed to load floor file:', err);
        showMessage('FAILED TO LOAD FLOOR', 'error');
    }
}

function initGameUI() {
    currentGuess = [];
    isTransitioning = false;
    setupWheel();
    attachControlHandlers();
    updateFloorUI();
}

function setupWheel() {
    const wheelContainer = document.getElementById('wheel-container');
    if (!wheelContainer) return;
    
    wheelContainer.innerHTML = '';
    const totalLetters = DAILY_PUZZLE.letters.length;
    if (totalLetters === 0) return;

    const radius = 68; 
    const nodeSize = 44;

    DAILY_PUZZLE.letters.forEach((letter, index) => {
        const angle = (index / totalLetters) * (2 * Math.PI) - (Math.PI / 2);
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));

        const btn = document.createElement('button');
        btn.className = 'letter-node';
        btn.textContent = letter;
        btn.style.position = 'absolute';
        btn.style.left = `calc(50% + ${x}px - ${nodeSize / 2}px)`;
        btn.style.top = `calc(50% + ${y}px - ${nodeSize / 2}px)`;
        btn.style.width = `${nodeSize}px`;
        btn.style.height = `${nodeSize}px`;
        btn.style.borderRadius = '50%';
        btn.style.border = '1px solid #ff1f2d';
        btn.style.boxShadow = '0 0 5px rgba(255, 31, 45, 0.3)';
        btn.style.backgroundColor = '#181818';
        btn.style.color = '#ffffff';
        btn.style.fontSize = '18px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        
        btn.onclick = () => selectLetter(letter);
        wheelContainer.appendChild(btn);
    });

    const centerHub = document.createElement('div');
    centerHub.style.position = 'absolute';
    centerHub.style.left = `calc(50% - 22px)`;
    centerHub.style.top = `calc(50% - 22px)`;
    centerHub.style.width = '44px';
    centerHub.style.height = '44px';
    centerHub.style.borderRadius = '50%';
    centerHub.style.border = '1px solid #ff1f2d';
    centerHub.style.backgroundColor = '#0e0e0e';
    
    wheelContainer.appendChild(centerHub);
}

function attachControlHandlers() {
    const deleteBtn = document.getElementById('action-delete-btn');
    const submitBtn = document.getElementById('action-submit-btn');

    if (deleteBtn) deleteBtn.onclick = handleDelete;
    if (submitBtn) submitBtn.onclick = handleSubmit;
}

function selectLetter(letter) {
    if (isTransitioning) return;
    if (currentGuess.length < currentFloor) {
        currentGuess.push(letter);
        updateGuessDisplay();
    }
}

function handleDelete() {
    if (isTransitioning) return;
    if (currentGuess.length > 0) {
        currentGuess.pop();
        updateGuessDisplay();
    }
}

function updateGuessDisplay() {
    const display = document.getElementById('guess-display');
    if (!display) return;

    display.innerHTML = '';

    let boxWidth = 34;
    let boxHeight = 38;
    let fontSize = 16;

    if (currentFloor >= 9) {
        boxWidth = 24;
        boxHeight = 30;
        fontSize = 12;
    } else if (currentFloor >= 7) {
        boxWidth = 28;
        boxHeight = 34;
        fontSize = 14;
    }

    for (let i = 0; i < currentFloor; i++) {
        const slot = document.createElement('div');
        slot.textContent = currentGuess[i] || '';
        
        slot.style.width = `${boxWidth}px`;
        slot.style.height = `${boxHeight}px`;
        slot.style.lineHeight = `${boxHeight}px`;
        slot.style.border = '1px solid #2a2a2a';
        slot.style.color = '#ffffff';
        slot.style.fontSize = `${fontSize}px`;
        slot.style.fontWeight = 'bold';
        slot.style.textAlign = 'center';
        slot.style.borderRadius = '8px';
        slot.style.backgroundColor = currentGuess[i] ? '#222222' : '#161616';
        slot.style.boxSizing = 'border-box';
        
        display.appendChild(slot);
    }
}

function updateFloorUI() {
    const cardFloorText = document.getElementById('card-floor-text');
    if (cardFloorText) {
        const formattedFloor = currentFloor < 10 ? `0${currentFloor}` : currentFloor;
        cardFloorText.textContent = currentFloor === 11 ? 'DESTINATION' : `FLOOR ${formattedFloor}`;
    }

    const elevatorSlots = document.querySelectorAll('.elevator-slot');
    elevatorSlots.forEach(slot => {
        const floorNum = parseInt(slot.getAttribute('data-floor'), 10);
        if (floorNum === currentFloor) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });

    currentGuess = [];
    if (currentFloor < 11) {
        showMessage('', 'info');
    }
    updateGuessDisplay();
}

function canBeFormedFromWheel(word) {
    return word.split('').every(char => DAILY_PUZZLE.letters.includes(char));
}

function handleSubmit() {
    if (isTransitioning) return;

    const word = currentGuess.join('').toUpperCase();
    const targetLength = currentFloor;

    if (word.length < targetLength) {
        showMessage(`NEED A ${targetLength}-LETTER WORD`, 'error');
        return;
    }

    const isValidLetterCombination = canBeFormedFromWheel(word);
    const isRecognizedWord = activeFloorWords.has(word);

    if (isValidLetterCombination && isRecognizedWord) {
        isTransitioning = true;
        
        if (currentFloor < maxFloor) {
            showMessage('VALID WORD! ASCENDING...', 'success');
            setTimeout(() => {
                currentFloor++;
                loadFloorData(currentFloor);
            }, 1000);
        } else {
            showMessage('TOP FLOOR REACHED!', 'victory');
        }
    } else {
        showMessage('NOT IN WORD LIST', 'error');
    }
}

function showMessage(msg, type) {
    let msgBox = document.getElementById('message-box');
    if (msgBox) {
        msgBox.textContent = msg;
        msgBox.style.color = (type === 'error') ? '#ff1f2d' : ((type === 'success' || type === 'victory') ? '#4dff79' : '#ff1f2d');
    }
}
