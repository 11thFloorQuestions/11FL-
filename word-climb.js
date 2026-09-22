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
  // Radius reduced to 82px and letter size increased to 50px for larger/tighter layout
  const radius = 82; 
  const nodeSize = 50;

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
    btn.style.border = '2px solid #e50914';
    btn.style.backgroundColor = '#222';
    btn.style.color = '#fff';
    btn.style.fontSize = '20px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', () => selectLetter(letter));
    wheelContainer.appendChild(btn);
  });

  const centerHub = document.createElement('div');
  centerHub.className = 'center-hub';
  centerHub.style.position = 'absolute';
  centerHub.style.left = `calc(50% - ${nodeSize / 2}px)`;
  centerHub.style.top = `calc(50% - ${nodeSize / 2}px)`;
  centerHub.style.width = `${nodeSize}px`;
  centerHub.style.height = `${nodeSize}px`;
  centerHub.style.borderRadius = '50%';
  centerHub.style.border = '2px solid #e50914';
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
    slot.style.border = '2px solid #e50914';
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
  // Update left floor elevator indicators
  const elevatorFloors = document.querySelectorAll('.elevator-floor');
  elevatorFloors.forEach(el => {
    const floorNum = parseInt(el.getAttribute('data-floor'), 10);
    el.classList.remove('active', 'passed');
    
    if (floorNum === currentFloor) {
      el.classList.add('active');
    } else if (floorNum < currentFloor) {
      el.classList.add('passed');
    }
  });

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
    msgBox.style.color = type === 'error' ? '#ff4d4d' : '#e50914';
  }
}
