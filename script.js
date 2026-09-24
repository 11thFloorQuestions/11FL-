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
    startDailyClimb();
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
    // If we already have a loaded set (Vault or Daily), just restart it
    if (gameState.questions.length > 0) {
        startGame();
    } else {
        startDailyClimb();
    }
});

function openModal(modalId) {
    safeToggleClass(modalId, 'hidden', false);
}

function closeModal(modalId) {
    safeToggleClass(modalId, 'hidden', true);
}

function openVault() {
    updateStatsUI();
    populateVault();
    openModal('modal-vault');
}

function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    
    vaultList.innerHTML = '';
    // Generate the 50 archive sets
    for (let i = 1; i <= 50; i++) {
        const btn = document.createElement('button');
        btn.className = 'vault-item-btn';
        btn.innerHTML = `<strong>SET ${String(i).padStart(2, '0')}</strong><span>Archive</span>`;
        btn.onclick = () => loadVaultSet(i);
        vaultList.appendChild(btn);
    }
}


// ==========================================
// 6. GAME LOGIC & TIMERS
// ==========================================

async function startDailyClimb() {
    try {
        // Hook into the daily drop
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load daily questions');
        const data = await response.json();
        gameState.questions = data;
        startGame();
    } catch (error) {
        console.error("Error loading questions.json:", error);
        // Dev Fallback in case of local testing without a server (CORS bypass)
        gameState.questions = generateFallbackQuestions();
        startGame();
    }
}

async function loadVaultSet(setId) {
    try {
        // Hook into the archives directory
        const response = await fetch(`archives/set${setId}.json`);
        if (!response.ok) throw new Error(`Failed to load archive set ${setId}`);
        const data = await response.json();
        gameState.questions = data;
        closeModal('modal-vault');
        startGame();
    } catch (error) {
        console.error(`Error loading archives/set${setId}.json:`, error);
        alert(`Archive Set ${setId} is missing or unavailable. Returning to Lobby.`);
    }
}

function startGame() {
    if (!gameState.questions || gameState.questions.length === 0) return;
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
        
        block.classList.toggle('active-floor', floorNum === gameState.currentFloor);
        block.classList.toggle('completed', floorNum < gameState.currentFloor);
    });
}

function loadNextQuestion() {
    startTimer();
    
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQ) {
        handleVictory(); // Failsafe
        return;
    }

    safeSetText('question-text', currentQ.question);
    
    const optionButtons = document.querySelectorAll('.options-grid .btn-option');
    optionButtons.forEach((btn, idx) => {
        btn.className = 'btn-option'; // reset option button state
        btn.textContent = currentQ.options[idx] || '';
        
        // Hide button if the JSON has fewer than 4 options
        btn.style.display = currentQ.options[idx] ? 'block' : 'none';
        
        // Checks if the answer matches either by index or exact string match
        const isCorrect = (currentQ.answerIndex === idx) || (currentQ.answer === currentQ.options[idx]);
        
        btn.onclick = () => handleAnswerSelect(isCorrect, btn); 
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
    
    // Prevent double-clicking
    document.querySelectorAll('.options-grid .btn-option').forEach(btn => {
        btn.onclick = null;
    });
    
    if (isCorrect) {
        if (buttonEl) buttonEl.classList.add('selected-correct');
        
        setTimeout(() => {
            if (gameState.currentFloor >= gameState.maxFloors) {
                handleVictory();
            } else {
                gameState.currentFloor++;
                gameState.currentQuestionIndex++;
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
    if (gameState.currentFloor > gameState.stats.bestFloor && gameState.stats.bestFloor !== 11) {
        gameState.stats.bestFloor = gameState.currentFloor;
    }
    
    safeSetText('game-over-title', 'ELEVATOR STOPPED');
    safeSetText('game-over-message', reason);
    safeSetText('final-floor-reached', `Stopped at FLOOR ${String(gameState.currentFloor).padStart(2, '0')}`);
    
    openModal('modal-game-over');
}

function handleVictory() {
    gameState.stats.played++;
    gameState.stats.wins++;
    gameState.stats.streak++;
    gameState.stats.bestFloor = 11;
    
    safeSetText('game-over-title', 'WELCOME TO THE 11TH FLOOR!');
    safeSetText('game-over-message', 'You completed all 10 floors successfully.');
    safeSetText('final-floor-reached', 'FLOOR 11 CLEARED');
    
    openModal('modal-game-over');
}

function updateStatsUI() {
    safeSetText('stat-played', gameState.stats.played);
    safeSetText('stat-wins', gameState.stats.wins);
    safeSetText('stat-streak', gameState.stats.streak);
    
    const bestFloorStr = gameState.stats.bestFloor === 11 ? '11 (WIN)' : String(gameState.stats.bestFloor).padStart(2, '0');
    safeSetText('stat-best', `FLOOR ${bestFloorStr}`);
}

// Development fallback data in case JSON files are missing
function generateFallbackQuestions() {
    const fallback = [];
    for(let i = 1; i <= 10; i++) {
        fallback.push({
            question: `Floor ${i}: Which pivotal 1913 modernist ballet score by Igor Stravinsky famously provoked a riot among the audience at its premiere in Paris?`,
            options: ["Petrushka", "The Firebird", "The Rite of Spring", "Daphnis et Chloé"],
            answerIndex: 2
        });
    }
    return fallback;
}

// ==========================================
// 7. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    updateStatsUI();
});
