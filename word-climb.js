// 11th Floor Word Climb - Responsive Layout & Logic

const DAILY_PUZZLE = {
  // 8 letters placed around the dial wheel
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
  setupUIContainers();
  setupWheel();
  updateFloorUI();
  attachControlHandlers();
}

function setupUIContainers() {
  let display = document.getElementById('guess-display') || document.querySelector('.guess-box');
  
  if (!display) {
    display = document.createElement('div');
    display.id = 'guess-display';
    display.style.margin = '15px auto';
    display.style.textAlign = 'center';
    display.style.width = '100%';
    display.style.maxWidth = '360px'; // Restrain width to standard mobile viewport
    display.style.display = 'flex';
    display.style.justifyContent = 'center';
    display.style.alignItems = 'center';
    display.style.boxSizing = 'border-box';
    
    const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(display, wheelContainer);
    } else {
      document.body.appendChild(display);
    }
  } else {
    // Apply flex layout to existing container for responsive row fitting
    display.style.display = 'flex';
    display.style.justifyContent = 'center';
    display.style.alignItems = 'center';
    display.style.flexWrap = 'nowrap';
  }
}

function setupWheel() {
  const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
  if (!wheelContainer) return;
  
  wheelContainer.innerHTML = '';
  wheelContainer.style.position = 'relative';
  wheelContainer.style.width = '240px';
  wheelContainer.style.height = '240px';
  wheelContainer.style.margin = '15px auto';

  const totalLetters = DAILY_PUZZLE.letters.length;
  const radius = 90; // Optimized radius for smaller mobile screens

  // Render 8 Outer Letters in a Ring
  DAILY_PUZZLE.letters.forEach((letter, index) => {
    const angle = (index / totalLetters) * (2 * Math.PI) - (Math.PI / 2);
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));

    const btn = document.createElement('button');
    btn.className = 'letter-node';
    btn.textContent = letter;
    btn.style.position = 'absolute';
    btn.style.left = `calc(50% + ${x}px - 22px)`;
    btn.style.top = `calc(50% + ${y}px - 22px)`;
    btn.style.width = '44px';
    btn.style.height = '44px';
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

  // Render Empty Center Brass Hub
  const centerHub = document.createElement('div');
  centerHub.className = 'center-hub';
  centerHub.style.position = 'absolute';
  centerHub.style.left = 'calc(50% - 22px)';
  centerHub.style.top = 'calc(50% - 22px)';
  centerHub.style.width = '44px';
  centerHub.style.height = '44px';
  centerHub.style.borderRadius = '50%';
  centerHub.style.border = '2px solid #d4af37';
  centerHub.style.backgroundColor = '#111';
  wheelContainer.appendChild(centerHub);
}

function attachControlHandlers() {
  const allButtons = Array.from(document.querySelectorAll('button'));
  
  const deleteBtn = allButtons.find(b => b.textContent.includes('DELETE') || b.textContent.includes('⌫'));
  if (deleteBtn) {
    deleteBtn.onclick = handleDelete;
  }

  const submitBtn = allButtons.find(b => b.textContent.includes('SUBMIT') || b.textContent.includes('↵'));
  if (submitBtn) {
    submitBtn.onclick = handleSubmit;
  }
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
  const display = document.getElementById('guess-display') || document.querySelector('.guess-box');
  if (!display) return;

  display.innerHTML = '';

  // DYNAMIC SLOT SIZING MATRIX: Automatically scales down for high floor counts (8-10 letters)
  let boxWidth = 38;
  let boxHeight = 42;
  let fontSize = 20;
  let margin = 3;

  if (currentFloor >= 8) {
    boxWidth = 28;
    boxHeight = 34;
    fontSize = 15;
    margin = 2;
  } else if (currentFloor >= 6) {
    boxWidth = 32;
    boxHeight = 38;
    fontSize = 17;
    margin = 2;
  }

  // Render slot boxes dynamically fitted to current floor
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
  const floorIndicator = document.getElementById('floor-display') || document.querySelector('.floor-indicator');
  if (floorIndicator) {
    floorIndicator.textContent = `FLOOR ${currentFloor} (${currentFloor} LETTERS)`;
  }
  currentGuess = [];
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
  const msgBox = document.getElementById('message-box') || document.querySelector('.message');
  if (msgBox) {
    msgBox.textContent = msg;
    msgBox.className = `message ${type}`;
  } else {
    alert(msg);
  }
}
