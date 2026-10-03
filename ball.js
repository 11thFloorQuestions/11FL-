// ==========================================================================
// 11th Floor TYKB (Think You Know Ball?) — Core Game Engine
// ==========================================================================

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
    return `<span style="color: var(--genre-pitch, #22c55e); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
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
// STATE MANAGEMENT & PERSISTENCE
// ==========================================

const gameState = {
    currentFloor: 1,
    maxFloors: 10,
    soundEnabled: true,
    timer: null,
    timeLeft: 20,
    questions: [],
    currentQuestionIndex: 0,
    batchIndex: 0,
    startTime: 0,
    timerInterval: null,
    timeElapsedSeconds: 0,
    stats: {
        played: 0,
        wins: 0,
        streak: 0,
        bestFloor: 1
    }
};

const STATS_KEY = '11th_floor_tykb_stats';

const floorMessageBatches = [
    [
        "Terrace banter warmth — get climbing!",
        "Matchweek trends incoming — stay sharp!",
        "Topical Premier League heat ahead!",
        "Tactical records — watch your step!",
        "Historical achievements (1992–present)!",
        "Deep Premier League stats unlocked!",
        "Squad Number assignment rules apply!",
        "Terrace Expert level trivia begins!",
        "Niche records ahead — stay locked in!",
        "Final floor hurdle — earn Floor 11!"
    ]
];

function loadSavedStats() {
    try {
        const saved = localStorage.getItem(STATS_KEY);
        if (saved) {
            gameState.stats = { ...gameState.stats, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Could not load stats from localStorage.');
    }
}

function saveStats() {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(gameState.stats));
    } catch (e) {
        console.warn('Could not save stats to localStorage.');
    }
}

loadSavedStats();


// ==========================================
// GAMEPLAY SESSION STOPWATCH TIMER
// ==========================================

function startSessionTimer() {
    stopSessionTimer();
    gameState.timeElapsedSeconds = 0;
    gameState.startTime = Date.now();
    const activeGameTimer = document.getElementById("active-game-timer");
    if (activeGameTimer) {
        activeGameTimer.style.display = "block";
        activeGameTimer.textContent = "00:00";
    }
    gameState.timerInterval = setInterval(updateSessionTimerDisplay, 1000);
}

function stopSessionTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
}

function updateSessionTimerDisplay() {
    gameState.timeElapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
    const activeGameTimer = document.getElementById("active-game-timer");
    if (activeGameTimer) {
        activeGameTimer.textContent = formatTime(gameState.timeElapsedSeconds);
    }
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}


// ==========================================
// AUDIO ENGINE
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
// NAVIGATION & CONTROLS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    safeAddListener('btn-start-climb', 'click', () => {
        startDailyClimb();
    });

    safeAddListener('btn-landing-stats', 'click', () => openVault());
    
    safeAddListener('btn-victory-stats', 'click', () => {
        openVault();
    });

    safeAddListener('btn-back-vault', 'click', () => {
        closeModal('modal-game-over');
        openVault();
    });

    safeAddListener('btn-close-vault', 'click', () => {
        closeModal('modal-vault');
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen && victoryScreen.style.display !== 'none') {
            resetToLandingScreen();
        }
    });

    safeAddListener('btn-try-again', 'click', () => {
        closeModal('modal-game-over');
        if (gameState.questions && gameState.questions.length > 0) {
            startGame();
        } else {
            startDailyClimb();
        }
    });

    safeAddListener('btn-sound-toggle', 'click', toggleSound);

    updateSoundUI();
});

function resetToLandingScreen() {
    stopSessionTimer();
    const screens = ['victory-screen', 'game-screen', 'floor-hud-container', 'gameplay-header', 'active-game-timer', 'footer-text'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const landing = document.getElementById('landing-screen');
    if (landing) landing.style.display = 'flex';
}

function showScreen(screenId) {
    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) victoryScreen.style.display = 'none';

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

function updateSoundUI() {
    const label = `SOUND: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    safeSetText('btn-sound-toggle', label);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (gameState.soundEnabled) {
        playElevatorDing();
    }
    updateSoundUI();
}


// ==========================================
// MODAL & VAULT CONTROLS
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
    
    vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading Archives...</div>';
    
    let archiveId = 1;
    const MAX_ARCHIVES = 100;
    const buttons = [];

    while (archiveId <= MAX_ARCHIVES) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox-ball.${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);
        
        if (data) {
            const btn = document.createElement('button');
            btn.className = 'vault-item-btn';
            btn.innerHTML = `<strong>Archive ${paddedId}</strong>`;
            btn.onclick = () => {
                triggerHaptic(15);
                loadVaultSet(paddedId, data);
            };
            buttons.push(btn);
        }
        archiveId++;
    }

    vaultList.innerHTML = '';
    if (buttons.length === 0) {
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No archives found.</div>';
    } else {
        buttons.forEach(btn => vaultList.appendChild(btn));
    }
}


// ==========================================
// DATA LOADING & NORMALIZATION
// ==========================================

function normalizeQuestions(data) {
    let rawList = [];
    if (!data) return [];
    
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data.floors)) rawList = data.floors;
    else if (Array.isArray(data.questions)) rawList = data.questions;

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
    let data = await fetchFileWithFallbacks('ball-questions.json');
    if (!data) data = await fetchFileWithFallbacks('sandbox-ball.22.json');

    if (data) {
        gameState.questions = normalizeQuestions(data);
    }
    launchGameUI();
}

function loadVaultSet(paddedId, data) {
    if (data) {
        gameState.questions = normalizeQuestions(data);
        closeModal('modal-vault');
        launchGameUI();
    }
}

function launchGameUI() {
    const landing = document.getElementById('landing-screen');
    const victory = document.getElementById('victory-screen');
    const hud = document.getElementById('floor-hud-container');
    const workspace = document.getElementById('game-workspace');
    const header = document.getElementById('gameplay-header');
    const footer = document.getElementById('footer-text');

    if (landing) landing.style.display = 'none';
    if (victory) victory.style.display = 'none';
    if (hud) hud.style.display = 'flex';
    if (workspace) workspace.style.display = 'flex';
    if (header) header.style.display = 'flex';
    if (footer) footer.style.display = 'block';

    startSessionTimer();
    startGame();
}


// ==========================================
// GAME LOOP & ELEVATOR PROGRESSION
// ==========================================

function startGame() {
    gameState.currentFloor = 1;
    gameState.currentQuestionIndex = 0;
    showScreen('game-screen');
    
    const hud = document.getElementById('floor-hud-container');
    const header = document.getElementById('gameplay-header');
    if (hud) hud.style.display = 'flex';
    if (header) header.style.display = 'flex';

    updateFloorUI();
    loadNextQuestion();
}

function updateFloorUI() {
    const cardFloorEl = document.getElementById('card-floor-text');
    if (cardFloorEl) {
        cardFloorEl.innerHTML = getOrdinalFloorHTML(gameState.currentFloor);
    }
    
    const activeBatch = floorMessageBatches[0];
    const ruleMsg = activeBatch[gameState.currentFloor - 1] || "No mistakes!";
    safeSetText('floor-rule-text', ruleMsg);

    document.querySelectorAll('.tower-floor, .floor-block').forEach(block => {
        const floorNum = parseInt(block.getAttribute('data-floor'), 10);
        block.classList.toggle('active', floorNum === gameState.currentFloor);
        block.classList.toggle('active-floor', floorNum === gameState.currentFloor);
        block.classList.toggle('completed', floorNum < gameState.currentFloor);
        block.classList.remove('failed');
    });
}

function loadNextQuestion() {
    startQuestionTimer();
    
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQ) return;

    safeSetText('question-text', currentQ.question);
    
    const shuffledOptions = shuffleArray(currentQ.options);
    
    const optionButtons = document.querySelectorAll('#options-grid .btn-option');
    optionButtons.forEach((btn, idx) => {
        btn.className = 'btn-option';
        if (typeof btn.blur === 'function') {
            btn.blur();
        }
        const optionVal = shuffledOptions[idx] || null;
        btn.textContent = optionVal || '';
        btn.style.display = optionVal ? 'block' : 'none';
        
        const isCorrect = (optionVal === currentQ.answer);
        btn.onclick = () => handleAnswerSelect(isCorrect, btn); 
    });
}

function startQuestionTimer() {
    clearInterval(gameState.timer);
    const totalDuration = 20000;
    const startTime = Date.now();
    gameState.timeLeft = 20;
    const timerBar = document.getElementById('timer-bar');
    
    if (timerBar) {
        timerBar.style.width = '100%';
    }

    gameState.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalDuration - elapsed);
        gameState.timeLeft = Math.ceil(remaining / 1000);

        if (timerBar) {
            timerBar.style.width = `${(remaining / totalDuration) * 100}%`;
        }

        if (remaining <= 0) {
            clearInterval(gameState.timer);
            handleGameOver('TIME EXPIRED');
        }
    }, 50);
}

function handleAnswerSelect(isCorrect, buttonEl) {
    clearInterval(gameState.timer);
    
    document.querySelectorAll('#options-grid .btn-option').forEach(btn => {
        btn.onclick = null;
        if (typeof btn.blur === 'function') {
            btn.blur();
        }
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
    stopSessionTimer();
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
    stopSessionTimer();
    gameState.currentFloor = 11;
    gameState.stats.played++;
    gameState.stats.wins++;
    gameState.stats.streak++;
    gameState.stats.bestFloor = 11;
    saveStats();
    
    triggerHaptic([50, 50, 50, 50, 100]);
    
    const victoryTimeDisplay = document.getElementById('victory-time-display');
    const victoryStreakDisplay = document.getElementById('victory-streak-display');
    const hudContainer = document.getElementById('floor-hud-container');
    const gameWorkspace = document.getElementById('game-workspace');
    const gameplayHeader = document.getElementById('gameplay-header');
    const activeGameTimer = document.getElementById('active-game-timer');
    const victoryScreen = document.getElementById('victory-screen');
    const footerText = document.getElementById('footer-text');

    if (victoryTimeDisplay) victoryTimeDisplay.textContent = formatTime(gameState.timeElapsedSeconds);
    if (victoryStreakDisplay) victoryStreakDisplay.textContent = `${gameState.stats.streak} Days`;

    if (hudContainer) hudContainer.style.display = 'none';
    if (gameWorkspace) gameWorkspace.style.display = 'none';
    if (gameplayHeader) gameplayHeader.style.display = 'none';
    if (activeGameTimer) activeGameTimer.style.display = 'none';
    if (footerText) footerText.style.display = 'none';

    if (victoryScreen) victoryScreen.style.display = 'flex';
}
