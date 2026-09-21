// 11th Floor Word Climb - Core Game Logic

const DAILY_PUZZLE = {
  letters: ['A', 'B', 'C', 'I', 'L', 'M', 'N', 'O', 'S'],
  dictionary: {
    4: ['CALM', 'COIN', 'NAIL', 'COAL', 'CLAN', 'LION', 'MAIL', 'SOIL', 'SCION', 'BAIL', 'SOMA', 'SLAM', 'BOIL'],
    5: ['CLIMB', 'CABIN', 'SALON', 'SMILE', 'MASON', 'CLAIM', 'COLON', 'COALS', 'NAILS', 'LOANS'],
    6: ['BONUS', 'CABINS', 'CLAIMS', 'ACTION', 'SOCIAL', 'MINALS', 'SMILES', 'BACON', 'SALONS'],
    7: ['CLIMBING', 'CABIN', 'BACON', 'ACTION', 'SMILES', 'CLIMBS', 'MASONS', 'COLONS'],
    8: ['BINOCIAL', 'CABIN', 'MASONS', 'CLAIMS', 'SOCIALS'],
    9: ['BINOCULAR', 'CLIMBING', 'CABIN'],
    10: ['BINOCULARS', 'CLIMBINGS']
  }
};

let currentFloor = 4;
const maxFloor = 10;
let currentGuess = [];
let wheelLetters = [...DAILY_PUZZLE.letters];

// DOM Elements
const currentFloorDisplay = document.getElementById('current-floor-display');
const targetLengthDisplay = document.getElementById('target-length');
const wordSlotsContainer = document.getElementById('word-slots');
const statusMessage = document.getElementById('status-message');
const letterRing = document.getElementById('letter-ring');
const shuffleBtn = document.getElementById('shuffle-btn');
const deleteBtn = document.getElementById('delete-btn');
const submitBtn = document.getElementById('submit-btn');

function initGame() {
  updateFloorUI();
  renderWheel();
  setupEventListeners();
}

function updateFloorUI() {
  const targetLength = currentFloor;
  currentFloorDisplay.textContent = `FLOOR ${currentFloor < 10 ? '0' + currentFloor : currentFloor}`;
  targetLengthDisplay.textContent = targetLength;
  
  wordSlotsContainer.innerHTML = '';
  currentGuess = [];
  
  for (let i = 0; i < targetLength; i++) {
    const slot = document.createElement('div');
    slot.className = 'word-slot';
    slot.id = `slot-${i}`;
    wordSlotsContainer.appendChild(slot);
  }
  
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function renderWheel() {
  letterRing.innerHTML = '';
  const totalLetters = wheelLetters.length;
  // Responsive radius calculation
  const isSmallScreen = window.innerWidth < 380;
  const radius = isSmallScreen ? 90 : 105;

  wheelLetters.forEach((letter, index) => {
    const angle = (index * (360 / totalLetters) - 90) * (Math.PI / 180);
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));

    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'letter-node';
    node.textContent = letter;
    node.style.transform = `translate(${x}px, ${y}px)`;
    
    // Explicit pointer event listening for cross-device compatibility
    const selectHandler = (e) => {
      e.preventDefault();
      handleLetterTap(letter, node);
    };

    node.addEventListener('pointerdown', selectHandler);
    letterRing.appendChild(node);
  });
}

function handleLetterTap(letter, node) {
  if (currentGuess.length < currentFloor) {
    currentGuess.push(letter);
    updateSlotsDisplay();
    
    node.classList.add('tapped');
    setTimeout(() => node.classList.remove('tapped'), 150);
  }
}

function updateSlotsDisplay() {
  for (let i = 0; i < currentFloor; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (slot) {
      slot.textContent = currentGuess[i] || '';
      if (currentGuess[i]) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
    }
  }
}

function setupEventListeners() {
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentGuess.length > 0) {
      currentGuess.pop();
      updateSlotsDisplay();
    }
  });

  shuffleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    wheelLetters.sort(() => Math.random() - 0.5);
    renderWheel();
  });

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSubmit();
  });

  // Re-calculate ring radius if window resizes
  window.addEventListener('resize', () => {
    renderWheel();
  });
}

function handleSubmit() {
  const word = currentGuess.join('');
  const targetLength = currentFloor;

  if (word.length < targetLength) {
    showMessage(`NEED A ${targetLength}-LETTER WORD`, 'error');
    shakeSlots();
    return;
  }

  const validWords = DAILY_PUZZLE.dictionary[targetLength] || [];
  
  if (validWords.includes(word) || word.length === targetLength) {
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
    shakeSlots();
  }
}

function showMessage(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `status-message ${type}`;
}

function shakeSlots() {
  wordSlotsContainer.classList.add('shake');
  setTimeout(() => {
    wordSlotsContainer.classList.remove('shake');
    currentGuess = [];
    updateSlotsDisplay();
  }, 500);
}

document.addEventListener('DOMContentLoaded', initGame);
