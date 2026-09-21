// 11th Floor Word Climb - Main Game Logic

const DAILY_PUZZLE = {
  // 9 letters: 8 outer + 1 center
  letters: ['C', 'L', 'I', 'M', 'B', 'A', 'T', 'O', 'R'],
  
  // Valid words organized by floor length (no proper nouns, allows US/UK & plurals)
  dictionary: {
    4: ['CLIM', 'BAIT', 'BART', 'BOAT', 'COAT', 'ROAM', 'TALK', 'COAL', 'BALT', 'COMB', 'CALM', 'LIMA', 'MOAT'],
    5: ['CLIMB', 'ACTOR', 'CAROT', 'TABOR', 'MORTA', 'COBAT', 'ATOMIC', 'TRAIL', 'TRAMP'],
    6: ['CLIMBER', 'COMBAT', 'BARIUM', 'ACTORS', 'COBALT', 'TRAILOR'],
    7: ['CLIMBER', 'COMBATS', 'COBALTS'],
    8: ['ACROBAT'],
    9: ['ACROBATIC']
  }
};

let currentFloor = 4; // Game starts on Floor 4
const maxFloor = 9;
let currentGuess = [];

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  currentFloor = 4;
  currentGuess = [];
  setupWheel();
  updateFloorUI();
  
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.style.display = 'none';
  }
}

function setupWheel() {
  const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
  if (!wheelContainer) return;
  
  wheelContainer.innerHTML = '';
  wheelContainer.style.position = 'relative';

  const totalLetters = DAILY_PUZZLE.letters.length;
  const outerLetters = DAILY_PUZZLE.letters.slice(0, totalLetters - 1);
  const centerLetter = DAILY_PUZZLE.letters[totalLetters - 1];

  // Render 8 Outer Letters in a Ring
  const radius = 100; // Radius in pixels for outer nodes
  outerLetters.forEach((letter, index) => {
    const angle = (index / outerLetters.length) * (2 * Math.PI) - (Math.PI / 2);
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));

    const btn = document.createElement('button');
    btn.className = 'letter-node';
    btn.textContent = letter;
    btn.style.position = 'absolute';
    btn.style.left = `calc(50% + ${x}px - 25px)`;
    btn.style.top = `calc(50% + ${y}px - 25px)`;
    btn.addEventListener('click', () => selectLetter(letter));
    wheelContainer.appendChild(btn);
  });

  // Render Center Letter Node
  const centerBtn = document.createElement('button');
  centerBtn.className = 'letter-node center-node';
  centerBtn.textContent = centerLetter;
  centerBtn.style.position = 'absolute';
  centerBtn.style.left = 'calc(50% - 25px)';
  centerBtn.style.top = 'calc(50% - 25px)';
  centerBtn.addEventListener('click', () => selectLetter(centerLetter));
  wheelContainer.appendChild(centerBtn);
}

function selectLetter(letter) {
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
  
  // STRICT DICTIONARY CHECK
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
