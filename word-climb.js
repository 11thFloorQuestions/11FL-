// 11th Floor Word Climb - Main Game Logic

const DAILY_PUZZLE = {
  // 8 letters placed around the dial
  letters: ['C', 'L', 'I', 'M', 'B', 'A', 'T', 'O'],
  
  // Valid words organized by floor length
  dictionary: {
    4: ['CLIM', 'BAIT', 'BART', 'BOAT', 'COAT', 'ROAM', 'TALK', 'COAL', 'BALT', 'COMB', 'CALM', 'LIMA', 'MOAT'],
    5: ['CLIMB', 'ACTOR', 'CAROT', 'TABOR', 'MORTA', 'COBAT', 'ATOMIC', 'TRAIL', 'TRAMP'],
    6: ['CLIMBER', 'COMBAT', 'BARIUM', 'ACTORS', 'COBALT'],
    7: ['CLIMBER', 'COMBATS', 'COBALTS'],
    8: ['ACROBAT']
  }
};

let currentFloor = 4; // Game starts on Floor 4
const maxFloor = 8;
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
  const radius = 100; // Radius in pixels for outer nodes

  // Render 8 Outer Letters in a Ring
  DAILY_PUZZLE.letters.forEach((letter, index) => {
    const angle = (index / totalLetters) * (2 * Math.PI) - (Math.PI / 2);
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

  // Render Empty Center Hub (No letter)
  const centerHub = document.createElement('div');
  centerHub.className = 'center-hub';
  centerHub.style.position = 'absolute';
  centerHub.style.left = 'calc(50% - 25px)';
  centerHub.style.top = 'calc(50% - 25px)';
  centerHub.style.width = '50px';
  centerHub.style.height = '50px';
  centerHub.style.borderRadius = '50%';
  centerHub.style.border = '2px solid #d4af37'; // Brass accent border
  centerHub.style.backgroundColor = '#1a1a1a';
  wheelContainer.appendChild(centerHub);
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
  if (!display) return;

  display.innerHTML = ''; // Clear container

  // Create slot boxes for each required letter on current floor
  for (let i = 0; i < currentFloor; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    slot.textContent = currentGuess[i] || '';
    
    // Inline styles for slot blocks if CSS isn't present
    slot.style.display = 'inline-block';
    slot.style.width = '35px';
    slot.style.height = '40px';
    slot.style.lineHeight = '40px';
    slot.style.margin = '0 4px';
    slot.style.border = '2px solid #d4af37';
    slot.style.color = '#fff';
    slot.style.fontSize = '20px';
    slot.style.fontWeight = 'bold';
    slot.style.textAlign = 'center';
    slot.style.backgroundColor = currentGuess[i] ? '#333' : '#111';
    
    display.appendChild(slot);
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
