// 11th Floor Word Climb - Fixed Validation & State Logic

const DAILY_PUZZLE = {
  // Wheel letters: P - A - N - T - H - E - R - S - O
  letters: ['P', 'A', 'N', 'T', 'H', 'E', 'R', 'S', 'O']
};

// Comprehensive list of valid English words formed from P-A-N-T-H-E-R-S-O
const VALID_WORDS = new Set([
  // 4-letter words
  "SHOP", "PATH", "PART", "PAST", "PEAR", "PEST", "PEAT", "POND", "PONT", 
  "PORT", "POST", "POTS", "PALE", "PANE", "PATS", "PROS", "PETS", "POET",
  "HOPE", "HORN", "HOST", "HEAT", "HEAR", "HERO", "HATE", "HATS", "HERB",
  "SNAP", "STAR", "STOP", "SOAP", "SOAR", "SORT", "SHOT", "SHOE", "POTS",
  "ROSE", "ROPE", "ROAN", "RENT", "REST", "RATE", "RATS", "TORN", "TRAP",
  "TOES", "TORE", "TONE", "TAPS", "TEAR", "THEN", "NEAR", "NEAT", "NEST", "POTS",
  
  // 5-letter words
  "PANTHER", "EARTH", "HEART", "SHAPE", "SHARE", "STORE", "STONE", "SHARP",
  "SHORT", "PHASE", "PHONE", "PRONE", "PASTE", "PANEL", "PANES", "PARTS",
  "PANTS", "PORTS", "POSTS", "PROSE", "HORNS", "HATES", "HEATS", "HEROES",
  "TRAPS", "TEARS", "TONES", "STARE", "SNORT", "OTHER", "AFTER", "NORTH", "SHOPS",

  // 6-letter words
  "PANTHER", "PANTHERS", "PARSON", "PATRON", "PASTER", "POTHER",
  "PASTEL", "PLANET", "PYTHON", "PRONTS", "REPATH", "HORNET", "THORNS",
  "ASTERN", "REPOST", "POSHER", "PARENT", "PATRONS", "STROP",

  // 7-letter words
  "PANTHER", "PATRONS", "PASTERN", "PORTANS", "PRONETS", "SHORTER", "PARENTS",

  // 8-letter words
  "PANTHERS", "PATRONESS", "PANTHROS",

  // 9-letter words
  "PANTHERSO"
]);

let currentFloor = 4;
const maxFloor = 9;
let currentGuess = [];
let isTransitioning = false;

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  currentFloor = 4;
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
  const radius = 78; 
  const nodeSize = 54;

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
    
    // Red outer border style matching header buttons
    btn.style.border = '1px solid #ff1f2d';
    btn.style.boxShadow = '0 0 5px rgba(255, 31, 45, 0.3)';
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
  centerHub.style.border = '1px solid #ff1f2d';
  centerHub.style.boxShadow = '0 0 5px rgba(255, 31, 45, 0.2)';
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
  const cardFloorText = document.getElementById('card-floor-text');
  if (cardFloorText) {
    const formattedFloor = currentFloor < 10 ? `0${currentFloor}` : currentFloor;
    cardFloorText.textContent = `FLOOR ${formattedFloor}`;
  }

  const cardFloorProgress = document.getElementById('card-floor-progress');
  if (cardFloorProgress) {
    const progressPercent = Math.min(100, Math.round((currentFloor / maxFloor) * 100));
    cardFloorProgress.style.width = `${progressPercent}%`;
  }

  // Active elevator block update (Only current floor is active)
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

function canBeFormedFromWheel(word) {
  const availableLetters = [...DAILY_PUZZLE.letters];
  for (let char of word) {
    const index = availableLetters.indexOf(char);
    if (index === -1) return false;
    availableLetters.splice(index, 1);
  }
  return true;
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
  const isRecognizedWord = VALID_WORDS.has(word);

  if (isValidLetterCombination && isRecognizedWord) {
    isTransitioning = true;
    showMessage('VALID WORD! ASCENDING...', 'success');
    
    setTimeout(() => {
      if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
      } else {
        showMessage('CONGRATULATIONS! TOP FLOOR REACHED!', 'victory');
      }
      isTransitioning = false;
    }, 1000);
  } else {
    // If invalid, show message and KEEP current floor state intact
    showMessage('NOT IN WORD LIST', 'error');
  }
}

function showMessage(msg, type) {
  const msgBox = document.getElementById('message-box');
  if (msgBox) {
    msgBox.textContent = msg;
    if (type === 'error') {
      msgBox.style.color = '#ff4d4d';
    } else if (type === 'success' || type === 'victory') {
      msgBox.style.color = '#4dff79';
    } else {
      msgBox.style.color = '#ff1f2d';
    }
  }
}
