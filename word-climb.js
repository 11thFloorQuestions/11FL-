// 11th Floor Word Climb - Main Game Logic

const DAILY_PUZZLE = {
  // 9 letters for the wheel/dial
  letters: ['C', 'L', 'I', 'M', 'B', 'A', 'T', 'O', 'R'],
  
  // Valid words organized by floor length (no proper nouns, allows US/UK & plurals)
  dictionary: {
    3: ['CAT', 'BAT', 'RAT', 'BIT', 'TAB', 'MAT', 'LAB', 'MOB', 'TOM', 'BAR', 'BOT', 'CAR'],
    4: ['CLIMB', 'BALT', 'COAL', 'BOAT', 'COAT', 'ROAM', 'TALK', 'BAMB', 'BAIT', 'BART'],
    5: ['CLIMB', 'ACTOR', 'CAROT', 'TABOR', 'MORTA', 'COBAT', 'ATOMIC'],
    6: ['CLIMBER', 'COMBAT', 'BARIUM', 'ACTORS', 'COBALT'],
    7: ['CLIMBER', 'COMBATS', 'COBALTS'],
    8: ['ACROBAT'],
    9: ['ACROBATIC']
  }
};

let currentFloor = 3; // Starts at Floor 3 (3-letter word)
const maxFloor = 9;
let currentGuess = [];

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  currentFloor = 3;
  currentGuess = [];
  setupWheel();
  updateFloorUI();
  
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.style.display = 'none'; // Hide start button once game initializes
  }
}

function setupWheel() {
  const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
  if (!wheelContainer) return;
  
  wheelContainer.innerHTML = '';
  
  DAILY_PUZZLE.letters.forEach((letter, index) => {
    const btn = document.createElement('button');
    btn.className = 'letter-node';
    btn.textContent = letter;
    btn.addEventListener('click', () => selectLetter(letter, btn));
    wheelContainer.appendChild(btn);
  });
}

function selectLetter(letter, button) {
  if (currentGuess.length < currentFloor) {
    currentGuess.push(letter);
    updateGuessDisplay();
  }
}

function clearGuess() {
  currentGuess = [];
  updateGuessDisplay();
}

function updateGuessDisplay() {
  const display = document.getElementById('guess-display') || document.querySelector('.guess-box');
  if (display) {
    display.textContent = currentGuess.join('');
  }
}

function updateFloorUI() {
  const floorIndicator = document.getElementById('floor-display') || document.querySelector('.floor-indicator');
  if (floorIndicator) {
    floorIndicator.textContent = `FLOOR ${currentFloor} (${currentFloor} LETTERS)`;
  }
  clearGuess();
}

function handleSubmit() {
  const word = currentGuess.join('');
  const targetLength = currentFloor;

  if (word.length < targetLength) {
    showMessage(`NEED A ${targetLength}-LETTER WORD`, 'error');
    return;
  }

  const validWords = DAILY_PUZZLE.dictionary[targetLength] || [];
  
  // STRICT CHECK: Only accepts words explicitly in the dictionary list
  if (validWords.includes(word)) {
    showMessage('VALID WORD! ASCENDING...', 'success');
    
    setTimeout(() => {
      if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
      } else {
        showMessage('CONGRATULATIONS! TOP FLOOR REACHED!', 'victory');
      }
    }, 1000);
  } else {
    showMessage('NOT IN WORD LIST', 'error');
  }
}

function showMessage(msg, type) {
  const msgBox = document.getElementById('message-box') || document.querySelector('.message');
  if (msgBox) {
    msgBox.textContent = msg;
    msgBox.className = `message ${type}`;
  } else {
    alert(msg);
  }
}
