// 11th Floor Word Climb - Main Game Logic

const DAILY_PUZZLE = {
  letters: ['C', 'L', 'I', 'M', 'B', 'A', 'T', 'O', 'R'],
  dictionary: {
    4: ['CLIM', 'BAIT', 'BART', 'BOAT', 'COAT', 'ROAM', 'TALK', 'COAL', 'BALT', 'COMB', 'CALM', 'LIMA', 'MOAT', 'MORT', 'TOMB', 'ROTA', 'TACO', 'BOAR', 'LOOT', 'TOOL', 'BOOT', 'MOOR', 'BAIL', 'CLAM', 'OATM', 'AMIT', 'BOLT', 'COLT', 'ROMA', 'TRAM', 'ATOM', 'LIMO', 'MIRO', 'MALT', 'BLOT', 'BOMA'],
    5: ['CLIMB', 'ACTOR', 'CAROT', 'TABOR', 'MORTA', 'COBAT', 'ATOMIC', 'TRAIL', 'TRAMP', 'TALOR', 'CAROL', 'ROBOT', 'ALTIM', 'CLARO', 'CLOAM', 'LOBAR', 'MOTAR', 'RABIC', 'TCOAL', 'MARTO', 'TIMAR'],
    6: ['CLIMBER', 'COMBAT', 'BARIUM', 'ACTORS', 'COBALT', 'TRACTOR', 'BORTAM', 'MORTAL', 'CARLOM', 'TAILOR'],
    7: ['CLIMBER', 'COMBATS', 'COBALTS', 'ACROBAT', 'CLIMBAT'],
    8: ['ACROBAT', 'ACROBATS'],
    9: ['ACROBATIC', 'CLIMBATOR']
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
  const radius = 78; 
  const nodeSize = 54; // Enlarge buttons and text for better visibility

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
    btn.style.border = '1px solid #282828';
    btn.style.backgroundColor = '#181818';
    btn.style.color = '#ffffff';
    btn.style.fontSize = '22px';
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
  centerHub.style.border = '1px solid #1f1f1f';
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

  let boxWidth = 34;
  let boxHeight = 38;
  let fontSize = 17;
  let margin = 3;

  if (currentFloor >= 8) {
    boxWidth = 25;
    boxHeight = 32;
    fontSize = 13;
    margin = 2;
  } else if (currentFloor >= 6) {
    boxWidth = 28;
    boxHeight = 34;
    fontSize = 15;
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
    slot.style.border = '1px solid #2a2a2a';
    slot.style.color = '#ffffff';
    slot.style.fontSize = `${fontSize}px`;
    slot.style.fontWeight = 'bold';
    slot.style.textAlign = 'center';
    slot.style.borderRadius = '6px';
    slot.style.backgroundColor = currentGuess[i] ? '#222222' : '#141414';
    slot.style.boxSizing = 'border-box';
    
    display.appendChild(slot);
  }
}

function updateFloorUI() {
  // Update card header floor text
  const cardFloorText = document.getElementById('card-floor-text');
  if (cardFloorText) {
    const formattedFloor = currentFloor < 10 ? `0${currentFloor}` : currentFloor;
    cardFloorText.textContent = `FLOOR ${formattedFloor}`;
  }

  // Update header red accent line width
  const cardFloorProgress = document.getElementById('card-floor-progress');
  if (cardFloorProgress) {
    const progressPercent = Math.min(100, Math.round((currentFloor / maxFloor) * 100));
    cardFloorProgress.style.width = `${progressPercent}%`;
  }

  // Update left elevator blocks - ONLY current active floor turns RED
  const elevatorBlocks = document.querySelectorAll('.elevator-block');
  elevatorBlocks.forEach(block => {
    const floorNum = parseInt(block.getAttribute('data-floor'), 10);
    block.classList.remove('active');

    if (floorNum === currentFloor) {
      block.classList.add('active');
    }
  });

  currentGuess = [];
  showMessage('', 'info');
  updateGuessDisplay();
}

function handleSubmit() {
  const word = currentGuess.join('').toUpperCase();
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
    msgBox.style.color = type === 'error' ? '#ff4d4d' : '#ff1f2d';
  }
}
