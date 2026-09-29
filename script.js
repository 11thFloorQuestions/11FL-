// ==========================================
// 1. HELPER FUNCTIONS & UTILITIES
// ==========================================

function safeAddListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, (e) => {
            triggerHaptic(15);
            handler(e);
        });
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

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getOrdinalFloorHTML(floorNum) {
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
    const ord = ordinals[floorNum - 1] || `${floorNum}th`;
    return `<span style="color: var(--genre-gold, #facc15); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
}


// ==========================================
// HAPTIC FEEDBACK ENGINE
// ==========================================

function triggerHaptic(pattern) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {}
    }
}


// ==========================================
// 2. STATE MANAGEMENT & STATS PERSISTENCE
// ==========================================

const gameState = {
    currentFloor: 1,
    maxFloors: 10,
    soundEnabled: true,
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

function loadSavedStats() {
    try {
        const saved = localStorage.getItem('11fl_stats');
        if (saved) {
            gameState.stats = { ...gameState.stats, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Could not load stats from localStorage.');
    }
}

function saveStats() {
    try {
        localStorage.setItem('11fl_stats', JSON.stringify(gameState.stats));
    } catch (e) {
        console.warn('Could not save stats to localStorage.');
    }
}

loadSavedStats();


// ==========================================
// AUDIO ENGINE (EXACT SOUND FILE PLAYBACK)
// ==========================================

const elevatorDingAudio = new Audio();
elevatorDingAudio.src = 'ding.mp3';

function playElevatorDing() {
    if (!gameState.soundEnabled) return;
    try {
        elevatorDingAudio.currentTime = 0;
        elevatorDingAudio.play().catch(e => {
            elevatorDingAudio.src = 'assets/audio/ding.mp3';
            elevatorDingAudio.play().catch(() => {});
        });
    } catch (e) {
        console.warn('Audio playback error:', e);
    }
}

function triggerLandingPageDing() {
    setTimeout(() => {
        playElevatorDing();
    }, 1370);
}


// ==========================================
// 3. NAVIGATION & SCREEN SWITCHING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    safeAddListener('btn-start-climb', 'click', () => {
        startDailyClimb();
    });

    safeAddListener('btn-util-exit', 'click', () => {
        resetGame();
        showScreen('landing-screen');
    });

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

    safeAddListener('btn-sound-toggle', 'click', toggleSound);
    safeAddListener('btn-sound-toggle-game', 'click', toggleSound);

    updateSoundUI();
});

function showScreen(screenId) {
    const screens = ['landing-screen', 'game-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === screenId) ? 'flex' : 'none';
        }
    });
    if (screenId === 'landing-screen') {
        triggerLandingPageDing();
    }
}


// ==========================================
// 4. SOUND TOGGLE CONTROLS
// ==========================================

function updateSoundUI() {
    const label = `SOUND: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    safeSetText('btn-sound-toggle', label);
    safeSetText('btn-sound-toggle-game', label);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (gameState.soundEnabled) {
        playElevatorDing();
    }
    updateSoundUI();
}


// ==========================================
// 5. MODAL, STATS & VAULT CONTROLS
// ==========================================

function openModal(modalId) {
    safeToggleClass(modalId, 'hidden', false);
}

function closeModal(modalId) {
    safeToggleClass(modalId, 'hidden', true);
}

function openVault() {
    renderStatsUI();
    populateVault();
    openModal('modal-vault');
}

function renderStatsUI() {
    const winRate = gameState.stats.played > 0 
        ? Math.round((gameState.stats.wins / gameState.stats.played) * 100) 
        : 0;

    safeSetText('stat-played', gameState.stats.played);
    safeSetText('stat-wins', gameState.stats.wins);
    safeSetText('stat-winrate', `${winRate}%`);
    safeSetText('stat-streak', gameState.stats.streak);

    const bestEl = document.getElementById('stat-bestfloor');
    if (bestEl) {
        bestEl.innerHTML = getOrdinalFloorHTML(gameState.stats.bestFloor);
    }
}

async function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    
    vaultList.innerHTML = '';
    let archiveId = 1;

    while (archiveId <= 50) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox.${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);
        
        if (data) {
            const btn = document.createElement('button');
            btn.className = 'vault-item-btn';
            btn.innerHTML = `<strong>Archive ${paddedId}</strong>`;
            btn.onclick = () => {
                triggerHaptic(15);
                loadVaultSet(paddedId, data);
            };
            vaultList.appendChild(btn);
        }
        archiveId++;
    }

    if (vaultList.children.length === 0) {
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No archives found.</div>';
    }
}


// ==========================================
// 6. DATA LOADING & NORMALIZATION
// ==========================================

function normalizeQuestions(data) {
    let rawList = [];
    if (!data) return generateFallbackQuestions();
    
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data.floors)) rawList = data.floors;
    else if (Array.isArray(data.questions)) rawList = data.questions;
    else return generateFallbackQuestions();

    return rawList.map(q => {
        const options = Array.isArray(q.options) ? [...q.options] : ["Option A", "Option B", "Option C", "Option D"];
        
        let answerText = "";
        if (typeof q.answer === 'string') answerText = q.answer;
        else if (typeof q.correct === 'string') answerText = q.correct;
        else if (typeof q.correctAnswer === 'string') answerText = q.correctAnswer;
        else if (typeof q.correct_answer === 'string') answerText = q.correct_answer;
        else if (typeof q.answerIndex === 'number' && options[q.answerIndex]) answerText = options[q.answerIndex];
        else if (typeof q.correctIndex === 'number' && options[q.correctIndex]) answerText = options[q.correctIndex];
        else if (typeof q.correct === 'number' && options[q.correct]) answerText = options[0];
        else if (typeof q.answer === 'number' && options[q.answer]) answerText = options[0];
        else answerText = options[0];

        return {
            question: q.question || "Question missing",
            options: options,
            answer: answerText
        };
    });
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
                return await res.json();
            }
        } catch (e) {}
    }
    return null;
}

async function startDailyClimb() {
    let data = await fetchFileWithFallbacks('questions.json');
    if (!data) data = await fetchFileWithFallbacks('sandbox.01.json');

    if (data) {
        gameState.questions = normalizeQuestions(data);
    } else {
        gameState.questions = generateFallbackQuestions();
    }
    startGame();
}

function loadVaultSet(paddedId, data) {
    if (data) {
        gameState.questions = normalizeQuestions(data);
        closeModal('modal-vault');
        startGame();
    }
}


// ==========================================
// 7. GAME LOOP & ELEVATOR PROGRESSION
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
    const cardFloorEl = document.getElementById('card-floor-text');
    if (cardFloorEl) {
        cardFloorEl.innerHTML = getOrdinalFloorHTML(gameState.currentFloor);
    }
    
    document.querySelectorAll('.tower-floor, .floor-block').forEach(block => {
        const floorNum = parseInt(block.getAttribute('data-floor'), 10);
        block.classList.toggle('active', floorNum === gameState.currentFloor);
        block.classList.toggle('active-floor', floorNum === gameState.currentFloor);
        block.classList.toggle('completed', floorNum < gameState.currentFloor);
        block.classList.remove('failed');
    });
}

function loadNextQuestion() {
    startTimer();
    
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQ) return;

    safeSetText('question-text', currentQ.question);
    
    const shuffledOptions = shuffleArray(currentQ.options);
    
    const optionButtons = document.querySelectorAll('.options-grid .btn-option');
    optionButtons.forEach((btn, idx) => {
        btn.className = 'btn-option';
        const optionVal = shuffledOptions[idx] || null;
        btn.textContent = optionVal || '';
        btn.style.display = optionVal ? 'block' : 'none';
        
        const isCorrect = (optionVal === currentQ.answer);
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
        playElevatorDing();
        triggerHaptic([35, 40, 35]);
        
        setTimeout(() => {
            if (gameState.currentFloor >= gameState.maxFloors) {
                handleVictory();
            } else {
                gameState.currentFloor++;
                gameState.currentQuestionIndex++;
                if (gameState.currentFloor > gameState.stats.bestFloor) {
                    gameState.stats.bestFloor = gameState.currentFloor;
                }
                updateFloorUI();
                loadNextQuestion();
            }
        }, 800);
    } else {
        if (buttonEl) buttonEl.classList.add('selected-wrong');
        triggerHaptic([80, 50, 120]);
        
        const activeBlock = document.querySelector(`.tower-floor[data-floor="${gameState.currentFloor}"]`);
        if (activeBlock) activeBlock.classList.add('failed');

        setTimeout(() => {
            handleGameOver('INCORRECT ANSWER');
        }, 800);
    }
}

function handleGameOver(reason) {
    gameState.stats.played++;
    gameState.stats.streak = 0;
    saveStats();
    
    safeSetText('game-over-title', 'ELEVATOR STOPPED');
    safeSetText('game-over-message', reason);
    
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
    const ord = ordinals[gameState.currentFloor - 1] || `${gameState.currentFloor}th`;
    const finalEl = document.getElementById('final-floor-reached');
    if (finalEl) {
        finalEl.innerHTML = `Stopped at <span style="color: var(--state-error, #EF4444); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
    }
    
    openModal('modal-game-over');
}

function handleVictory() {
    gameState.currentFloor = 11;
    gameState.stats.played++;
    gameState.stats.wins++;
    gameState.stats.streak++;
    gameState.stats.bestFloor = 11;
    saveStats();
    
    updateFloorUI();
    triggerHaptic([50, 50, 50, 50, 100]);
    
    safeSetText('game-over-title', '');
    const msgEl = document.getElementById('game-over-message');
    if (msgEl) {
        msgEl.innerHTML = '<span class="congrats-green">Congratulations!</span> You\'ve reached the 11th Floor.<br><br>Come back tomorrow to continue your streak.';
    }
    safeSetText('final-floor-reached', '');
    
    openModal('modal-game-over');
}

function generateFallbackQuestions() {
    return [
        { question: "Which planet in our solar system is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: "Mars" },
        { question: "What is the capital city of France?", options: ["Paris", "Berlin", "Madrid", "Rome"], answer: "Paris" },
        { question: "How many sides does a hexagon have?", options: ["6", "5", "7", "8"], answer: "6" },
        { question: "Which element has the chemical symbol 'O'?", options: ["Oxygen", "Gold", "Osmium", "Silver"], answer: "Oxygen" },
        { question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Claude Monet"], answer: "Leonardo da Vinci" },
        { question: "What is the largest ocean on Earth?", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean" },
        { question: "In which year did the Apollo 11 moon landing take place?", options: ["1969", "1965", "1972", "1975"], answer: "1969" },
        { question: "What is the hardest natural substance on Earth?", options: ["Diamond", "Quartz", "Granite", "Titanium"], answer: "Diamond" },
        { question: "Which musical instrument has 88 keys?", options: ["Piano", "Organ", "Harpsichord", "Accordion"], answer: "Piano" },
        { question: "What gas do plants absorb during photosynthesis?", options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide" }
    ];
}
