// ==========================================
// 1. HELPER FUNCTIONS & UTILITIES
// ==========================================

function safeAddListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, handler);
    }
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}

function safeToggleClass(id, className, force) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle(className, force);
    }
}


// ==========================================
// 2. STATE MANAGEMENT
// ==========================================

const gameState = {
    currentFloor: 1,
    maxFloors: 10,
    soundEnabled: false,
    timer: null,
    timeLeft: 15,
    questions: [],
    currentQuestionIndex: 0,
    stats: {
        played: 0,
        wins: 0,
        streak: 0,
        bestFloor: 1
    }
};


// ==========================================
// 3. NAVIGATION & SCREEN SWITCHING
// ==========================================

// Single-page Hub navigation
safeAddListener('btn-select-questions', 'click', () => {
    showScreen('landing-screen');
});

safeAddListener('btn-hub-back', 'click', () => {
    showScreen('main-hub-screen');
});

// Game flow navigation
safeAddListener('btn-start-climb', 'click', () => {
    startGame();
});

safeAddListener('btn-util-exit', 'click', () => {
    resetGame();
    showScreen('landing-screen');
});

function showScreen(screenId) {
    const screens = ['main-hub-screen', 'landing-screen', 'game-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === screenId) ? 'flex' : 'none';
        }
    });
}


// ==========================================
// 4. SOUND TOGGLE CONTROLS
// ==========================================

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const label = `SOUND: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    safeSetText('btn-sound-toggle', label);
    safeSetText('btn-sound-toggle-game', label);
}

safeAddListener('btn-sound-toggle', 'click', toggleSound);
safeAddListener('btn-sound-toggle-game', 'click', toggleSound);


// ==========================================
// 5. MODAL & VAULT CONTROLS
// ==========================================

safeAddListener('btn-landing-stats', 'click', () => openVault());
safeAddListener('btn-back-vault', 'click', () => {
    closeModal('modal-game-over');
    openVault();
});

safeAddListener('btn-close-vault', 'click', () => closeModal('modal-vault'));
safeAddListener('btn-close-stats', 'click', () => closeModal('modal-stats'));
safeAddListener('btn-try-again', 'click', () => {
    closeModal('modal-game-over');
    startGame();
});

function openModal(modalId) {
    safeToggleClass(modalId, 'hidden', false);
}

function closeModal(modalId) {
    safeToggleClass(modalId, 'hidden', true);
}

function openVault() {
    updateStatsUI();
    openModal('modal-vault');
}


// ==========================================
// 6. GAME LOGIC & TIMERS
// ==========================================

function startGame() {
    gameState.currentFloor = 1;
    gameState.currentQuestionIndex = 0;
    showScreen('game-screen');
    updateFloorUI();
    loadNextQuestion();
}

function resetGame() {
    clearInterval(gameState.timer);
    gameState.currentFloor = 1;
}

function updateFloorUI() {
    const floorStr = String(gameState.currentFloor).padStart(2, '0');
    safeSetText('card-floor-text', `FLOOR ${floorStr}`);
    
    // Highlight matching floor block in building shaft
    document.querySelectorAll('.floor-block').forEach(block => {
        const floorNum = parseInt(block.getAttribute('data-floor'), 10);
        
        // Exact match with your style.css (.active-floor & .completed)
        block.classList.toggle('active-floor', floorNum === gameState.currentFloor);
        block.classList.toggle('completed', floorNum < gameState.currentFloor);
    });
}

function loadNextQuestion() {
    startTimer();
    safeSetText('question-text', `Floor ${gameState.currentFloor}: Which option allows you to advance?`);
    
    const optionButtons = document.querySelectorAll('.options-grid .btn-option');
    optionButtons.forEach((btn, idx) => {
        btn.className = 'btn-option'; // reset option button state
        btn.textContent = `Floor ${gameState.currentFloor} - Option ${idx + 1}`;
        btn.onclick = () => handleAnswerSelect(idx === 0, btn); 
    });
}

function startTimer() {
    clearInterval(gameState.timer);
    gameState.timeLeft = 15;
    const timerBar = document.getElementById('timer-bar');
    
    if (timerBar) {
        timerBar.style.width = '100%';
    }

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        if (timerBar) {
            timerBar.style.width = `${(gameState.timeLeft / 15) * 100}%`;
        }

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleGameOver('TIME EXPIRED');
        }
    }, 1000);
}

function handleAnswerSelect(isCorrect, buttonEl) {
    clearInterval(gameState.timer);
    
    if (isCorrect) {
        if (buttonEl) buttonEl.classList.add('selected-correct');
        
        setTimeout(() => {
            if (gameState.currentFloor >= gameState.maxFloors) {
                handleVictory();
            } else {
                gameState.currentFloor++;
                updateFloorUI();
                loadNextQuestion();
            }
        }, 500);
    } else {
        if (buttonEl) buttonEl.classList.add('selected-wrong');
        
        setTimeout(() => {
            handleGameOver('INCORRECT ANSWER');
        }, 500);
    }
}

function handleGameOver(reason) {
    gameState.stats.played++;
    gameState.stats.streak = 0;
    
    safeSetText('game-over-title', 'ELEVATOR STOPPED');
    safeSetText('game-over-message', reason);
    safeSetText('final-floor-reached', `Stopped at FLOOR ${String(gameState.currentFloor).padStart(2, '0')}`);
    
    openModal('modal-game-over');
}

function handleVictory() {
    gameState.stats.played++;
    gameState.stats.wins++;
    gameState.stats.streak++;
    gameState.stats.bestFloor = 10;
    
    safeSetText('game-over-title', 'PENTHOUSE REACHED!');
    safeSetText('game-over-message', 'You completed all 10 floors!');
    safeSetText('final-floor-reached', 'FLOOR 10 CLEARED');
    
    openModal('modal-game-over');
}

function updateStatsUI() {
    safeSetText('stat-played', gameState.stats.played);
    safeSetText('stat-wins', gameState.stats.wins);
    safeSetText('stat-streak', gameState.stats.streak);
    safeSetText('stat-best', `FLOOR ${String(gameState.stats.bestFloor).padStart(2, '0')}`);
}


// ==========================================
// 7. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    updateStatsUI();
});
