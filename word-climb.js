// 11th Floor Word Climb - Main Game Logic & Resistant UI Controls

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
  
  // Guard observer: Re-inject controls if DOM updates clear them
  const observer = new MutationObserver(() => {
    ensureControlsExist();
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

function initGame() {
  currentFloor = 4;
  currentGuess = [];
  setupUIContainers();
  setupWheel();
  ensureControlsExist();
  updateFloorUI();
}

function setupUIContainers() {
  let msgBox = document.getElementById('message-box') || document.querySelector('.message');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'message-box';
    msgBox.style.minHeight = '24px';
    msgBox.style.margin = '10px auto';
    msgBox.style.textAlign = 'center';
    msgBox.style.fontSize = '16px';
    msgBox.style.fontWeight = 'bold';
    msgBox.style.color = '#d4af37';
    
    const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(msgBox, wheelContainer);
    } else {
      document.body.appendChild(msgBox);
    }
  }

  let display = document.getElementById('guess-display') || document.querySelector('.guess-box');
  if (!display) {
    display = document.createElement('div');
    display.id = 'guess-display';
    display.style.margin = '15px auto';
    display.style.textAlign = 'center';
    display.style.width = '100%';
    display.style.maxWidth = '360px';
    display.style.display = 'flex';
    display.style.justifyContent = 'center';
    display.style.alignItems = 'center';
    
    const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(display, wheelContainer);
    } else {
      document.body.appendChild(display);
    }
  } else {
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
  wheelContainer.style.width = '260px';
  wheelContainer.style.height = '260px';
  wheelContainer.style.margin = '15px auto';

  const totalLetters = DAILY_PUZZLE.letters.length;
  const radius = 100;

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

function ensureControlsExist() {
  let controlsContainer = document.getElementById('controls-container');
  
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.gap = '15px';
    controlsContainer.style.margin = '15px auto';

    const wheelContainer = document.getElementById('wheel-container') || document.querySelector('.wheel');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(controlsContainer, wheelContainer.nextSibling);
    } else {
      document.body.appendChild(controlsContainer);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'action-delete-btn';
    deleteBtn.textContent = '⌫ DELETE';
    styleControlBtn(deleteBtn);
    deleteBtn.onclick = handleDelete;
    controlsContainer.appendChild(deleteBtn);

    const submitBtn = document.createElement('button');
    submitBtn.id = 'action-submit-btn';
    submitBtn.textContent = '↵ SUBMIT';
    styleControlBtn(submitBtn);
    submitBtn.onclick = handleSubmit;
    controlsContainer.appendChild(submitBtn);
  }
}

function styleControlBtn(btn) {
  btn.style.padding = '10px 20px';
  btn.style.fontSize = '16px';
  btn.style.fontWeight = 'bold';
  btn.style.color = '#d4af37';
  btn.style.backgroundColor = '#222';
  btn.style.border = '2px solid #d4af37';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
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
  const msgBox = document.getElementById('message-box') || document.querySelector('.message');
  if (msgBox) {
    msgBox.textContent = msg;
    msgBox.style.color = type === 'error' ? '#ff4d4d' : '#d4af37';
  }
}
