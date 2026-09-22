// 11th Floor Word Climb - Main Game Logic

const DAILY_PUZZLE = {
  letters: ['C', 'L', 'I', 'M', 'B', 'A', 'T', 'O', 'R'],
  dictionary: {
    4: ['CLIM', 'BAIT', 'BART', 'BOAT', 'COAT', 'ROAM', 'TALK', 'COAL', 'BALT', 'COMB', 'CALM', 'LIMA', 'MOAT', 'MORT', 'TOMB', 'ROTA', 'TACO', 'BOAR', 'LOOT', 'TOOL', 'BOOT', 'MOOR'],
    5: ['CLIMB', 'ACTOR', 'CAROT', 'TABOR', 'MORTA', 'COBAT', 'ATOMIC', 'TRAIL', 'TRAMP', 'TALOR', 'CAROL', 'ROBOT'],
    6: ['CLIMBER', 'COMBAT', 'BARIUM', 'ACTORS', 'COBALT', 'TRACTOR'],
    7: ['CLIMBER', 'COMBATS', 'COBALTS'],
    8: ['ACROBAT'],
    9: ['ACROBATIC']
  }
};

let currentFloor = 4;
const maxFloor = 9;
let currentGuess = [];

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  currentFloor = 4;
  currentGuess = [];
  setupWheel();
  attachControlHandlers();
  updateFloorUI();
}

function setupWheel() {
  const wheelContainer = document.getElementById('wheel-container');
  if (!wheelContainer) return;
  
  wheelContainer.innerHTML = '';

  const totalLetters = DAILY_PUZZLE.letters.length;
  const radius = 95; // Sized for compact mobile/desktop alignment

  DAILY_PUZZLE.letters.forEach((letter, index) => {
    const angle = (index / totalLetters) * (2 * Math.PI) - (Math.PI / 2);
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));

    const btn = document.createElement('button');
    btn.className = 'letter-node';
    btn.textContent = letter;
    btn.style.position = 'absolute';
    btn.style.left = `calc(50% + ${x}px - 21px)`;
    btn.style.top = `calc(50% + ${y}px - 21px)`;
    btn.style.width = '42px';
    btn.style.height = '42px';
    btn.style.borderRadius = '50%';
    btn.style.border = '2px solid #d4af37';
    btn.style.backgroundColor = '#222';
    btn.style.color = '#fff';
    btn.style.fontSize = '18px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', () => selectLetter(letter));
    wheelContainer.appendChild(btn);
  });

  const centerHub = document.createElement('div');
  centerHub.className = 'center-hub';
  centerHub.style.position = 'absolute';
  centerHub.style.left = 'calc(50% - 21px)';
  centerHub.style.top = 'calc(50% - 21px)';
  centerHub.style.width = '42px';
  centerHub.style.height = '42px';
  centerHub.style.borderRadius = '50%';
  centerHub.style.border = '2px solid #d4af37';
  centerHub.style.backgroundColor = '#111';
  wheelContainer.appendChild(centerHub);
}

function attachControlHandlers() {
  const deleteBtn = document.getElementById('action-delete-btn');
  const submitBtn = document.getElementById('action-submit-btn');

  if (deleteBtn) deleteBtn.onclick = handleDelete;
  if (submitBtn) submitBtn.onclick = handleSubmit;
}

function selectLetter(letter) {
  if (currentGuess.length < currentFloor) {
    currentGuess.push(letter);
    updateGuessDisplay();
  }
}

function handleDelete() {
  if (currentGuess.length > 0) {
    currentGuess.pop();
    updateGuessDisplay();
  }
}

function updateGuessDisplay() {
  const display = document.getElementById('guess-display');
  if (!display) return;

  display.innerHTML = '';

  let boxWidth = 36;
  let boxHeight = 40;
  let fontSize = 18;
  let margin = 3;

  if (currentFloor >= 8) {
    boxWidth = 26;
    boxHeight = 32;
    fontSize = 14;
    margin = 2;
  } else if (currentFloor >= 6) {
    boxWidth = 30;
    boxHeight = 36;
    fontSize = 16;
    margin = 2;
  }

  for (let i = 0; i < currentFloor; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    slot.textContent = currentGuess[i] || '';
    
    slot.style.display = 'inline-block';
    slot.style.width = `${boxWidth}px`;
    slot.style.height = `${boxHeight}px`;
    slot.style.lineHeight = `${boxHeight}px`;
    slot.style.margin = `0 ${margin}px`;
    slot.style.border = '2px solid #d4af37';
    slot.style.color = '#fff';
    slot.style.fontSize = `${fontSize}px`;
    slot.style.fontWeight = 'bold';
    slot.style.textAlign = 'center';
    slot.style.borderRadius = '4px';
    slot.style.backgroundColor = currentGuess[i] ? '#333' : '#1a1a1a';
    slot.style.boxSizing = 'border-box';
    
    display.appendChild(slot);
  }
}

function updateFloorUI() {
  const floorIndicator = document.getElementById('floor-display');
  if (floorIndicator) {
    floorIndicator.textContent = `FLOOR ${currentFloor} (${currentFloor} LETTERS)`;
  }
  
  currentGuess = [];
  showMessage('', 'info');
  updateGuessDisplay();
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
  const msgBox = document.getElementById('message-box');
  if (msgBox) {
    msgBox.textContent = msg;
    msgBox.style.color = type === 'error' ? '#ff4d4d' : '#d4af37';
  }
}
