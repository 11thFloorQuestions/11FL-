// Default Founding Daily Set Fallback (50 Sets available via JSON fetch or fallback)
const DEFAULT_GAME_SET = [
    { question: "Which planet in our solar system has the highest density?", options: ["Earth", "Jupiter", "Mercury", "Saturn"], answer: 0 },
    { question: "What was the highest-grossing film of the 1980s?", options: ["E.T. the Extra-Terrestrial", "Star Wars: The Empire Strikes Back", "Back to the Future", "Raiders of the Lost Ark"], answer: 0 },
    { question: "In what year did the Berlin Wall fall?", options: ["1987", "1989", "1991", "1993"], answer: 1 },
    { question: "Which element on the periodic table has the chemical symbol 'W'?", options: ["Tungsten", "Mercury", "Bismuth", "Wolframite"], answer: 0 },
    { question: "Who composed the opera 'The Marriage of Figaro'?", options: ["Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Johann Sebastian Bach", "Franz Schubert"], answer: 0 },
    { question: "What is the longest river in South America?", options: ["Amazon River", "Paraná River", "Orinoco River", "Magdalena River"], answer: 0 },
    { question: "Which country won the inaugural FIFA World Cup in 1930?", options: ["Uruguay", "Argentina", "Brazil", "Italy"], answer: 0 },
    { question: "What is the hardest naturally occurring substance on Earth?", options: ["Diamond", "Corundum", "Quartz", "Topaz"], answer: 0 },
    { question: "Who wrote the 1897 Gothic horror novel 'Dracula'?", options: ["Bram Stoker", "Mary Shelley", "Oscar Wilde", "Edgar Allan Poe"], answer: 0 },
    { question: "Which organ in the human body consumes approximately 20% of its oxygen?", options: ["Brain", "Heart", "Liver", "Lungs"], answer: 0 }
];

// State Variables
let currentQuestions = [...DEFAULT_GAME_SET];
let currentFloorIndex = 0; // 0 to 9 (Floor 01 to Floor 10)
let timerInterval = null;
let timeLeft = 15;
let isAnswerLocked = false;

// Local Stats
let stats = JSON.parse(localStorage.getItem('11th_floor_stats')) || {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestFloor: 1
};

// Audio Context for Elevator Sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// Format floor label according to strict project guidelines: Floor 01 to Floor 11
function formatFloorText(floorNum) {
    const padded = String(floorNum).padStart(2, '0');
    return `Floor ${padded}`;
}

// DOM Elements
const landingScreen = document.getElementById('landing-screen');
const gameScreen = document.getElementById('game-screen');
const cardFloorText = document.getElementById('card-floor-text');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const optionButtons = document.querySelectorAll('.btn-option');
const timerBar = document.getElementById('timer-bar');
const buildingShaftBlocks = document.querySelectorAll('.building-shaft .floor-block');

// Modals
const modalGameOver = document.getElementById('modal-game-over');
const modalVault = document.getElementById('modal-vault');
const modalStats = document.getElementById('modal-stats');

// Game Flow Functions
function startNewGame() {
    initAudio();
    currentFloorIndex = 0;
    isAnswerLocked = false;
    
    landingScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    closeModals();
    
    loadFloorQuestion();
}

function loadFloorQuestion() {
    if (currentFloorIndex >= 10) {
        triggerVictory();
        return;
    }

    isAnswerLocked = false;
    const currentQuestion = currentQuestions[currentFloorIndex];

    // Update Header Floor Text
    cardFloorText.textContent = formatFloorText(currentFloorIndex + 1);

    // Update Shaft Floor Indicators
    buildingShaftBlocks.forEach((block, index) => {
        block.classList.remove('completed', 'active-floor');
        if (index < currentFloorIndex) {
            block.classList.add('completed');
        } else if (index === currentFloorIndex) {
            block.classList.add('active-floor');
        }
    });

    // Populate Question & Options
    questionText.textContent = currentQuestion.question;
    optionButtons.forEach((btn, idx) => {
        btn.textContent = currentQuestion.options[idx];
        btn.className = 'btn-option';
        btn.disabled = false;
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 15;
    updateTimerBar();

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerBar();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleFailure("Time Expired!");
        }
    }, 100);
}

function updateTimerBar() {
    const percentage = Math.max(0, (timeLeft / 15) * 100);
    timerBar.style.width = `${percentage}%`;
}

function handleAnswerSelection(selectedIndex) {
    if (isAnswerLocked) return;
    isAnswerLocked = true;
    clearInterval(timerInterval);

    const currentQuestion = currentQuestions[currentFloorIndex];
    const isCorrect = selectedIndex === currentQuestion.answer;

    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === currentQuestion.answer) {
            btn.classList.add('selected-correct');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('selected-wrong');
        }
    });

    if (isCorrect) {
        playSound('correct');
        setTimeout(() => {
            currentFloorIndex++;
            if (currentFloorIndex === 10) {
                triggerVictory();
            } else {
                loadFloorQuestion();
            }
        }, 1100);
    } else {
        playSound('wrong');
        setTimeout(() => {
            handleFailure("Incorrect Answer!");
        }, 1100);
    }
}

function handleFailure(reasonText) {
    clearInterval(timerInterval);
    const floorReachedNum = currentFloorIndex + 1;

    // Update Local Stats
    stats.played += 1;
    stats.currentStreak = 0;
    if (floorReachedNum > stats.bestFloor) {
        stats.bestFloor = floorReachedNum;
    }
    saveStats();

    // Setup Game Over Modal State
    document.getElementById('game-over-title').textContent = "ELEVATOR STOPPED";
    document.getElementById('game-over-message').textContent = reasonText;
    document.getElementById('final-floor-reached').textContent = `Stopped at ${formatFloorText(floorReachedNum)}`;

    modalGameOver.classList.remove('hidden');
}

function triggerVictory() {
    clearInterval(timerInterval);
    
    // Set Header State to Floor 11 for Victory State
    cardFloorText.textContent = formatFloorText(11);
    
    buildingShaftBlocks.forEach(block => {
        block.classList.remove('active-floor');
        block.classList.add('completed');
    });

    // Update Local Stats
    stats.played += 1;
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
    }
    stats.bestFloor = 11;
    saveStats();

    // Setup Victory Modal State
    document.getElementById('game-over-title').textContent = "11th FLOOR REACHED";
    document.getElementById('game-over-message').textContent = "Elevator Climb Completed!";
    document.getElementById('final-floor-reached').textContent = "Victory State: Floor 11";

    modalGameOver.classList.remove('hidden');
}

function saveStats() {
    localStorage.setItem('11th_floor_stats', JSON.stringify(stats));
    updateStatsUI();
}

function updateStatsUI() {
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-wins').textContent = stats.wins;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-best').textContent = formatFloorText(stats.bestFloor);
}

function closeModals() {
    modalGameOver.classList.add('hidden');
    modalVault.classList.add('hidden');
    modalStats.classList.add('hidden');
}

function populateVaultList() {
    const vaultList = document.getElementById('vault-list');
    vaultList.innerHTML = '';

    for (let i = 1; i <= 50; i++) {
        const item = document.createElement('button');
        item.className = 'game-card-btn';
        item.style.padding = '12px 16px';
        item.innerHTML = `
            <span class="game-num">SET ${String(i).padStart(2, '0')}</span>
            <span class="game-name" style="font-size: 0.95rem;">11th Floor Questions Archive #${i}</span>
        `;
        item.addEventListener('click', () => {
            closeModals();
            startNewGame();
        });
        vaultList.appendChild(item);
    }
}

// Event Listeners
document.getElementById('btn-start-game-1').addEventListener('click', startNewGame);

optionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => handleAnswerSelection(index));
});

// Utility Bar Listeners
document.getElementById('btn-util-lobby').addEventListener('click', () => {
    clearInterval(timerInterval);
    gameScreen.style.display = 'none';
    landingScreen.style.display = 'flex';
    closeModals();
});

document.getElementById('btn-util-vault').addEventListener('click', () => {
    populateVaultList();
    modalVault.classList.remove('hidden');
});

document.getElementById('btn-util-stats').addEventListener('click', () => {
    updateStatsUI();
    modalStats.classList.remove('hidden');
});

// Modal Close Listeners
document.getElementById('btn-close-vault').addEventListener('click', () => modalVault.classList.add('hidden'));
document.getElementById('btn-close-stats').addEventListener('click', () => modalStats.classList.add('hidden'));

// Game Over Modal Action Choices
document.getElementById('btn-try-again').addEventListener('click', () => {
    startNewGame();
});

document.getElementById('btn-view-stats').addEventListener('click', () => {
    closeModals();
    updateStatsUI();
    modalStats.classList.remove('hidden');
});

document.getElementById('btn-back-vault').addEventListener('click', () => {
    closeModals();
    populateVaultList();
    modalVault.classList.remove('hidden');
});

// Initialization
updateStatsUI();
