// Think You Know Ball? — Daily Premier League Engine

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
    if (el) el.textContent = text;
}

function safeToggleClass(id, className, force) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle(className, force);
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
    return `<span style="color: var(--genre-terrace, #84CC16); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
}

function triggerHaptic(pattern) {
    if ('vibrate' in navigator) {
        try { navigator.vibrate(pattern); } catch (e) {}
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
    timeLeft: 30,
    questions: [],
    currentQuestionIndex: 0,
    batchIndex: 0,
    stats: {
        played: 0,
        wins: 0,
        streak: 0,
        bestFloor: 1
    }
};

const floorMessageBatches = [
    [
        "Premier League trivia begins — no mistakes!",
        "Miss one and down to Ground Floor you go!",
        "3rd Floor reached — smooth sailing.",
        "One mistake resets you to Ground Floor.",
        "Halfway up! Stay focused.",
        "6th Floor unlocked — pure precision!",
        "Ground Floor is far below now.",
        "Almost there!",
        "Keep going!",
        "Final hurdle — make it count!"
    ]
];

function loadSavedStats() {
    try {
        const saved = localStorage.getItem('11fl_terrace_stats');
        if (saved) gameState.stats = { ...gameState.stats, ...JSON.parse(saved) };
    } catch (e) {
        console.warn('Could not load stats from localStorage.');
    }
}

function saveStats() {
    try {
        localStorage.setItem('11fl_terrace_stats', JSON.stringify(gameState.stats));
    } catch (e) {
        console.warn('Could not save stats to localStorage.');
    }
}

loadSavedStats();

// ==========================================
// AUDIO ENGINE
// ==========================================

const elevatorDingAudio = new Audio();
elevatorDingAudio.src = 'ding.mp3';

function playElevatorDing() {
    if (!gameState.soundEnabled) return;
    try {
        elevatorDingAudio.currentTime = 0;
        elevatorDingAudio.play().catch(() => {});
    } catch (e) {}
}

// ==========================================
// 3. NAVIGATION & INITIALISATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    safeAddListener('btn-start-climb', 'click', () => startDailyClimb());
    safeAddListener('btn-landing-stats', 'click', () => openVault());
    safeAddListener('btn-back-vault', 'click', () => {
        closeModal('modal-game-over');
        openVault();
    });
    safeAddListener('btn-close-vault', 'click', () => closeModal('modal-vault'));
    safeAddListener('btn-try-again', 'click', () => {
        closeModal('modal-game-over');
        startGame();
    });
    safeAddListener('btn-sound-toggle', 'click', toggleSound);

    updateSoundUI();
});

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (gameState.soundEnabled) playElevatorDing();
    updateSoundUI();
}

function updateSoundUI() {
    safeSetText('btn-sound-toggle', `SOUND: ${gameState.soundEnabled ? 'ON' : 'OFF'}`);
}

function openModal(id) { safeToggleClass(id, 'hidden', false); }
function closeModal(id) { safeToggleClass(id, 'hidden', true); }

// ==========================================
// 4. VAULT & STATS CONTROLS
// ==========================================

function openVault() {
    renderStatsUI();
    populateVault();
    openModal('modal-vault');
}

function renderStatsUI() {
    const winRate = gameState.stats.played > 0 ? Math.round((gameState.stats.wins / gameState.stats.played) * 100) : 0;
    safeSetText('stat-played', gameState.stats.played);
    safeSetText('stat-wins', gameState.stats.wins);
    safeSetText('stat-winrate', `${winRate}%`);
    safeSetText('stat-streak', gameState.stats.streak);

    const bestEl = document.getElementById('stat-bestfloor');
    if (bestEl) bestEl.innerHTML = getOrdinalFloorHTML(gameState.stats.bestFloor);
}

async function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    
    vaultList.innerHTML = '';
    let archiveId = 1;

    while (archiveId <= 50) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox-terrace.${paddedId}.json`;
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
// 5. DATA LOADING & NORMALISATION
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
        else if (typeof q.answerIndex === 'number' && options[q.answerIndex]) answerText = options[q.answerIndex];
        else if (typeof q.correctIndex === 'number' && options[q.correctIndex]) answerText = options[q.correctIndex];
        else if (typeof q.correct === 'number' && options[q.correct]) answerText = options[q.correct];
        else if (typeof q.answer === 'number' && options[q.answer]) answerText = options[q.answer];
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
        `./archives/${filename}`,
        `./${filename}`,
        `./data/${filename}`,
        filename
    ];

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path);
            if (res.ok) return await res.json();
        } catch (e) {}
    }
    return null;
}

async function startDailyClimb() {
    let data = await fetchFileWithFallbacks('terrace-questions.json');
    if (!data) data = await fetchFileWithFallbacks('sandbox-terrace.01.json');

    gameState.questions = normalizeQuestions(data);

    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('gameplay-header').style.display = 'flex';
    document.getElementById('floor-hud-container').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'flex';

    startGame();
}

function loadVaultSet(paddedId, data) {
    if (data) {
        gameState.questions = normalizeQuestions(data);
        closeModal('modal-vault');

        document.getElementById('landing-screen').style.display = 'none';
        document.getElementById('gameplay-header').style.display = 'flex';
        document.getElementById('floor-hud-container').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'flex';

        startGame();
    }
}

// ==========================================
// 6. GAME LOOP & ELEVATOR PROGRESSION
// ==========================================

function startGame() {
    if (!gameState.questions || gameState.questions.length === 0) {
        gameState.questions = generateFallbackQuestions();
    }
    gameState.currentFloor = 1;
    gameState.currentQuestionIndex = 0;
    updateFloorUI();
    loadNextQuestion();
}

function updateFloorUI() {
    const cardFloorEl = document.getElementById('card-floor-text');
    if (cardFloorEl) cardFloorEl.innerHTML = getOrdinalFloorHTML(gameState.currentFloor);

    const activeBatch = floorMessageBatches[0];
    safeSetText('floor-rule-text', activeBatch[gameState.currentFloor - 1] || "No mistakes!");

    document.querySelectorAll('.tower-floor').forEach(block => {
        const floorNum = parseInt(block.getAttribute('data-floor'), 10);
        block.classList.toggle('active', floorNum === gameState.currentFloor);
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
        btn.style.display = optionVal ? 'flex' : 'none';

        const isCorrect = (optionVal === currentQ.answer);
        btn.onclick = () => handleAnswerSelect(isCorrect, btn);
    });
}

function startTimer() {
    clearInterval(gameState.timer);
    const totalDuration = 30000;
    const startTime = Date.now();
    const timerBar = document.getElementById('timer-bar');
    if (timerBar) timerBar.style.width = '100%';

    gameState.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalDuration - elapsed);

        if (timerBar) timerBar.style.width = `${(remaining / totalDuration) * 100}%`;

        if (remaining <= 0) {
            clearInterval(gameState.timer);
            handleGameOver('TIME EXPIRED');
        }
    }, 50);
}

function handleAnswerSelect(isCorrect, buttonEl) {
    clearInterval(gameState.timer);
    document.querySelectorAll('.options-grid .btn-option').forEach(btn => btn.onclick = null);

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

        setTimeout(() => handleGameOver('INCORRECT ANSWER'), 800);
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
        finalEl.innerHTML = `Stopped at <span style="color: var(--state-error, #ef4444); font-weight: 800;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
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
        msgEl.innerHTML = '<span class="congrats-green">Congratulations!</span> You\'ve cleared Think You Know Ball? and reached the 11th Floor.<br><br>Come back tomorrow to continue your streak.';
    }
    safeSetText('final-floor-reached', '');
    openModal('modal-game-over');
}

function generateFallbackQuestions() {
    return [
        { question: "Which club won the inaugural Premier League title in 1992-93?", options: ["Manchester United", "Blackburn Rovers", "Arsenal", "Aston Villa"], answer: "Manchester United" },
        { question: "Who holds the record for the most goals in a single 38-game Premier League season?", options: ["Erling Haaland", "Alan Shearer", "Mohamed Salah", "Thierry Henry"], answer: "Erling Haaland" },
        { question: "Which player has accumulated the most overall appearances in Premier League history?", options: ["Gareth Barry", "Ryan Giggs", "James Milner", "Frank Lampard"], answer: "Gareth Barry" },
        { question: "Who scored the famous 'Agueroooo' goal to seal the title in 2012?", options: ["Sergio Agüero", "David Silva", "Yaya Touré", "Edin Džeko"], answer: "Sergio Agüero" },
        { question: "Which team completed an entire 38-game Premier League season undefeated?", options: ["Arsenal", "Manchester City", "Chelsea", "Manchester United"], answer: "Arsenal" },
        { question: "Who won the Golden Boot in three consecutive Premier League seasons (2003–2006)?", options: ["Thierry Henry", "Ruud van Nistelrooy", "Alan Shearer", "Didier Drogba"], answer: "Thierry Henry" },
        { question: "Which manager famously led 5000-1 outsiders Leicester City to the title in 2015-16?", options: ["Claudio Ranieri", "Nigel Pearson", "Brendan Rodgers", "Craig Shakespeare"], answer: "Claudio Ranieri" },
        { question: "Who was the first player to record 100 Premier League assists?", options: ["Ryan Giggs", "Cesc Fàbregas", "Wayne Rooney", "Dennis Bergkamp"], answer: "Ryan Giggs" },
        { question: "Which club holds the record for conceding the fewest goals in a single PL season (15)?", options: ["Chelsea", "Arsenal", "Manchester United", "Liverpool"], answer: "Chelsea" },
        { question: "Who scored the fastest hat-trick in Premier League history (2 mins 56 secs)?", options: ["Sadio Mané", "Robbie Fowler", "Jermain Defoe", "Gabriel Agbonlahor"], answer: "Sadio Mané" }
    ];
}
