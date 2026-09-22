// 11th Floor Word Climb - Production Engine

const DAILY_PUZZLE = {
  // Active daily letters: U - N - D - E - R - S - T - A
  letters: ['U', 'N', 'D', 'E', 'R', 'S', 'T', 'A']
};

let currentFloor = 4;
const maxFloor = 10;
let currentGuess = [];
let isTransitioning = false;

// Global set to hold valid dictionary words
window.MASTER_DICTIONARY = new Set();

document.addEventListener('DOMContentLoaded', () => {
  loadDictionaryAndInit();
});

async function loadDictionaryAndInit() {
  try {
    // Automatically reads the words.js text file from your repository
    const response = await fetch('words.js');
    if (response.ok) {
      const text = await response.text();
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const word = lines[i].trim().toUpperCase();
        if (word.length >= 4) {
          window.MASTER_DICTIONARY.add(word);
        }
      }
      console.log(`[11th Floor] Master dictionary loaded: ${window.MASTER_DICTIONARY.size} words.`);
    }
  } catch (err) {
    console.warn('[11th Floor] Could not load local dictionary file:', err);
  }

  // Draw the game UI
  initGame();
}

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
  wheelContainer.style.position = 'relative';
  wheelContainer.style.width = '200px';
  wheelContainer.style.height = '200px';
  wheelContainer.style.margin = '20px auto 0 auto';

  const totalLetters = DAILY_PUZZLE.letters.length;
  const radius = 70; 
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
    btn.style.fontSize = '20px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    
    btn.onclick = () => selectLetter(letter);
    wheelContainer.appendChild(btn);
  });

  const centerHub = document.createElement('div');
  centerHub.style.position = 'absolute';
  centerHub.style.left = `calc(50% - 20px)`;
  centerHub.style.top = `calc(50% - 20px)`;
  centerHub.style.width = '40px';
  centerHub.style.height = '40px';
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

  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent.includes('DELETE')) btn.onclick = handleDelete;
    if (btn.textContent.includes('SUBMIT')) btn.onclick = handleSubmit;
  });
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
  display.style.textAlign = 'center';
  display.style.margin = '15px 0';

  let boxWidth = 32;
  let boxHeight = 36;
  let fontSize = 16;
  let margin = 2;

  if (currentFloor >= 9) {
    boxWidth = 22;
    boxHeight = 30;
    fontSize = 12;
    margin = 1;
  } else if (currentFloor >= 7) {
    boxWidth = 26;
    boxHeight = 32;
    fontSize = 14;
    margin = 2;
  }

  for (let i = 0; i < currentFloor; i++) {
    const slot = document.createElement('div');
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

  const elevatorBlocks = document.querySelectorAll('.elevator-block, [data-floor]');
  elevatorBlocks.forEach(block => {
    const floorNum = parseInt(block.getAttribute('data-floor'), 10);
    if (floorNum === currentFloor) {
      block.style.border = '1px solid #ff1f2d';
      block.style.backgroundColor = 'rgba(255, 31, 45, 0.2)';
    } else {
      block.style.border = '1px solid #222';
      block.style.backgroundColor = 'transparent';
    }
  });

  currentGuess = [];
  showMessage('', 'info');
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

  let isRecognizedWord = false;
  if (window.MASTER_DICTIONARY && window.MASTER_DICTIONARY.has) {
    isRecognizedWord = window.MASTER_DICTIONARY.has(word);
  }

  if (isValidLetterCombination && isRecognizedWord) {
    isTransitioning = true;
    showMessage('VALID WORD! ASCENDING...', 'success');
    
    setTimeout(() => {
      if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
      } else {
        showMessage('TOP FLOOR REACHED!', 'victory');
      }
      isTransitioning = false;
    }, 1000);
  } else {
    showMessage('NOT IN WORD LIST', 'error');
  }
}

function showMessage(msg, type) {
  let msgBox = document.getElementById('message-box');
  if (msgBox) {
    msgBox.textContent = msg;
    msgBox.style.color = (type === 'error') ? '#ff4d4d' : ((type === 'success' || type === 'victory') ? '#4dff79' : '#ff1f2d');
  }
}
