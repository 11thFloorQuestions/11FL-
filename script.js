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

safeAddListener('btn-start-climb', 'click', () => {
    startDailyClimb();
});

safeAddListener('btn-util-exit', 'click', () => {
    resetGame();
    showScreen('landing-screen');
});

function showScreen(screenId) {
    const screens = ['landing-screen', 'game-screen'];
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
safeAddListener('btn-try-again', 'click', () => {
    closeModal('modal-game-over');
    if (gameState.questions && gameState.questions.length > 0) {
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
    populateVault();
    openModal('modal-vault');
}

function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    
    vaultList.innerHTML = '';
    for (let i = 1; i <= 50; i++) {
        const paddedId = String(i).padStart(2, '0');
        const btn = document.createElement('button');
        btn.className = 'vault-item-btn';
        btn.innerHTML = `<strong>SET ${paddedId}</strong><span>Archive</span>`;
        btn.onclick = () => loadVaultSet(paddedId);
        vaultList.appendChild(btn);
    }
}


// ==========================================
// 6. DATA LOADING & NORMALIZATION
// ==========================================

function normalizeQuestions(data) {
    if (!data) return generateFallbackQuestions();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.floors)) return data.floors;
    if (Array.isArray(data.questions)) return data.questions;
    return generateFallbackQuestions();
}

async function fetchFileWithFallbacks(filename) {
    const candidatePaths = [
        `./${filename}`,
        `./assets/data/floors/${filename}`,
        `./archives/${filename}`,
        `./data/${filename}`,
        filename
    ];

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                console.log(`Successfully loaded ${filename} from ${path}`);
                return await res.json();
            }
        } catch (e) {
            // Path attempt failed; try next candidate
        }
    }
    return null;
}

async function fetchFloorSequence() {
    const questions = [];
    for (let i = 1; i <= 10; i++) {
        const paddedId = String(i).padStart(2, '0');
        const fileData = await fetchFileWithFallbacks(`floor_${paddedId}.json`);
        if (fileData) {
            if (Array.isArray(fileData)) {
                questions.push(fileData[0]);
            } else if (fileData.question) {
                questions.push(fileData);
            }
        }
    }
    return questions.length === 10 ? questions : null;
}

async function startDailyClimb() {
    let data = await fetchFileWithFallbacks('questions.json');
    if (!data) data = await fetchFileWithFallbacks('sandbox.50.json');
    if (!data) data = await fetchFileWithFallbacks('sandbox.01.json');

    if (data) {
        gameState.questions = normalizeQuestions(data);
    } else {
        const floorSequence = await fetchFloorSequence();
        if (floorSequence) {
            gameState.questions = floorSequence;
        } else {
            console.warn("Could not locate floor files or daily sets. Using fallback.");
            gameState.questions = generateFallbackQuestions();
        }
    }
    startGame();
}

async function loadVaultSet(paddedId) {
    const filename = `sandbox.${paddedId}.json`;
    const data = await fetchFileWithFallbacks(filename);

    if (data) {
        gameState.questions = normalizeQuestions(data);
        closeModal('modal-vault');
        startGame();
    } else {
        console.error(`Failed to load ${filename}`);
        alert(`Could not find ${filename}. Check that the file is uploaded to your repository.`);
    }
}


// ==========================================
// 7. GAME LOOP & TIMERS
// ==========================================

function startGame() {
    if (!gameState.questions || gameState.questions.length === 0) {
        gameState.questions = generateFallbackQuestions();
    }
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
        console.error("Missing question data at index:", gameState.currentQuestionIndex);
        return;
    }

    const currentFloorStr = String(gameState.currentFloor);
    safeSetText('question-text', `${currentFloorStr}. ${currentQ.question}`);
    
    const optionButtons = document.querySelectorAll('.options-grid .btn-option');
    optionButtons.forEach((btn, idx) => {
        btn.className = 'btn-option';
        const optionVal = currentQ.options ? currentQ.options[idx] : null;
        btn.textContent = optionVal || '';
        btn.style.display = optionVal ? 'block' : 'none';
        
        const isCorrect = (currentQ.answerIndex === idx) || (currentQ.answer === optionVal);
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
    
    safeSetText('game-over-title', 'ELEVATOR STOPPED');
    safeSetText('game-over-message', reason);
    safeSetText('final-floor-reached', `Stopped at FLOOR ${String(gameState.currentFloor).padStart(2, '0')}`);
    
    openModal('modal-game-over');
}

function handleVictory() {
    gameState.stats.played++;
    gameState.stats.wins++;
    gameState.stats.streak++;
    
    safeSetText('game-over-title', 'WELCOME TO THE 11TH FLOOR!');
    safeSetText('game-over-message', 'You completed all 10 floors!');
    safeSetText('final-floor-reached', 'FLOOR 11 CLEARED');
    
    openModal('modal-game-over');
}

function generateFallbackQuestions() {
    const fallback = [];
    for(let i = 1; i <= 10; i++) {
        fallback.push({
            question: "Sample Question - replace or ensure data files are uploaded.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            answerIndex: 0
        });
    }
    return fallback;
}
