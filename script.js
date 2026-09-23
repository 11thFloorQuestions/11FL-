// State Variables
let currentQuestions = [];
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

// Audio Context
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
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15);
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

function formatFloorText(floorNum) {
    const padded = String(floorNum).padStart(2, '0');
    return `Floor ${padded}`;
}

// DOM Elements
const landingScreen = document.getElementById('landing-screen');
const gameScreen = document.getElementById('game-screen');
const cardFloorText = document.getElementById('card-floor-text');
const questionText = document.getElementById('question-text');
const optionButtons = document.querySelectorAll('.btn-option');
const timerBar = document.getElementById('timer-bar');
const buildingShaftBlocks = document.querySelectorAll('.building-shaft .floor-block');

// Modals
const modalGameOver = document.getElementById('modal-game-over');
const modalVault = document.getElementById('modal-vault');
const modalStats = document.getElementById('modal-stats');

// Data Fetching
async function loadQuestionsData(sourcePath = 'questions.json') {
    try {
        const response = await fetch(sourcePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            currentQuestions = data;
        } else if (data.questions && Array.isArray(data.questions)) {
            currentQuestions = data.questions;
        } else if (data.floors && Array.isArray(data.floors)) {
            currentQuestions = data.floors;
        } else {
            throw new Error('Unrecognized JSON structure');
        }
        return true;
    } catch (err) {
        console.error("Failed to load question set:", err);
        questionText.textContent = "Error loading question set from JSON.";
        return false;
    }
}

// Game Flow
async function startNewGame(sourcePath = 'questions.json') {
    initAudio();
    currentFloorIndex = 0;
    isAnswerLocked = false;
    
    questionText.textContent = "Loading Questions...";
    landingScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    closeModals();

    const loaded = await loadQuestionsData(sourcePath);
    if (loaded && currentQuestions.length > 0) {
        loadFloorQuestion();
    }
}

function loadFloorQuestion() {
    if (currentFloorIndex >= 10 || currentFloorIndex >= currentQuestions.length) {
        triggerVictory();
        return;
    }

    isAnswerLocked = false;
    const currentQuestion = currentQuestions[currentFloorIndex];

    cardFloorText.textContent = formatFloorText(currentFloorIndex + 1);

    buildingShaftBlocks.forEach((block, index) => {
        block.classList.remove('completed', 'active-floor');
        if (index < currentFloorIndex) {
            block.classList.add('completed');
        } else if (index === currentFloorIndex) {
            block.classList.add('active-floor');
        }
    });

    questionText.textContent = currentQuestion.question || currentQuestion.text;
    
    const options = currentQuestion.options || currentQuestion.answers || [];
    optionButtons.forEach((btn, idx) => {
        if (options[idx] !== undefined) {
            btn.style.display = 'block';
            btn.textContent = options[idx];
            btn.className = 'btn-option';
            btn.disabled = false;
        } else {
            btn.style.display = 'none';
        }
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
    
    let correctAnswerIndex = currentQuestion.answer;
    if (correctAnswerIndex === undefined) correctAnswerIndex = currentQuestion.correctIndex;
    if (correctAnswerIndex === undefined && currentQuestion.correct !== undefined) {
        if (typeof currentQuestion.correct === 'number') {
            correctAnswerIndex = currentQuestion.correct;
        } else {
            const options = currentQuestion.options || currentQuestion.answers || [];
            correctAnswerIndex = options.indexOf(currentQuestion.correct);
        }
    }

    const isCorrect = selectedIndex === correctAnswerIndex;

    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctAnswerIndex) {
            btn.classList.add('selected-correct');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('selected-wrong');
        }
    });

    if (isCorrect) {
        playSound('correct');
        setTimeout(() => {
            currentFloorIndex++;
            if (currentFloorIndex === 10 || currentFloorIndex === currentQuestions.length) {
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

    stats.played += 1;
    stats.currentStreak = 0;
    if (floorReachedNum > stats.bestFloor) {
        stats.bestFloor = floorReachedNum;
    }
    saveStats();

    document.getElementById('game-over-title').textContent = "ELEVATOR STOPPED";
    document.getElementById('game-over-message').textContent = reasonText;
    document.getElementById('final-floor-reached').textContent = `Stopped at ${formatFloorText(floorReachedNum)}`;

    modalGameOver.classList.remove('hidden');
}

function triggerVictory() {
    clearInterval(timerInterval);
    cardFloorText.textContent = formatFloorText(11);
    
    buildingShaftBlocks.forEach(block => {
        block.classList.remove('active-floor');
        block.classList.add('completed');
    });

    stats.played += 1;
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
    }
    stats.bestFloor = 11;
    saveStats();

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

async function populateVaultList() {
    const vaultList = document.getElementById('vault-list');
    vaultList.innerHTML = '<div style="color:#888; text-align:center; padding:10px;">Loading Vault Archives...</div>';

    try {
        const res = await fetch('archives/index.json').catch(() => null);
        let archiveFiles = [];
        
        if (res && res.ok) {
            archiveFiles = await res.json();
        } else {
            archiveFiles = Array.from({ length: 50 }, (_, i) => ({
                id: `set_${i + 1}`,
                title: `Archive Set #${String(i + 1).padStart(2, '0')}`,
                path: `archives/set_${i + 1}.json`
            }));
        }

        vaultList.innerHTML = '';
        archiveFiles.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'game-card-btn';
            btn.style.padding = '12px 16px';
            btn.innerHTML = `
                <span class="game-num">SET ${String(idx + 1).padStart(2, '0')}</span>
                <span class="game-name" style="font-size: 0.95rem;">${item.title || item.name || `Archive Set #${idx + 1}`}</span>
            `;
            btn.addEventListener('click', () => {
                startNewGame(item.path || `archives/${item.id}.json`);
            });
            vaultList.appendChild(btn);
        });
    } catch (err) {
        vaultList.innerHTML = '<div style="color:#ff1f2d; text-align:center; padding:10px;">Failed to load vault files.</div>';
    }
}

// Event Listeners
document.getElementById('btn-start-game-1').addEventListener('click', () => startNewGame('questions.json'));

optionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => handleAnswerSelection(index));
});

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

document.getElementById('btn-close-vault').addEventListener('click', () => modalVault.classList.add('hidden'));
document.getElementById('btn-close-stats').addEventListener('click', () => modalStats.classList.add('hidden'));

document.getElementById('btn-try-again').addEventListener('click', () => startNewGame('questions.json'));

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

// Initial Page Load Setup
updateStatsUI();
