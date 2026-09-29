// 11th Floor Terrace — Daily Premier League Engine

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
    } catch (e) {}
}

function saveStats() {
    try {
        localStorage.setItem('11fl_terrace_stats', JSON.stringify(gameState.stats));
    } catch (e) {}
}

loadSavedStats();

const elevatorDingAudio = new Audio();
elevatorDingAudio.src = 'ding.mp3';

function playElevatorDing() {
    if (!gameState.soundEnabled) return;
    try {
        elevatorDingAudio.currentTime = 0;
        elevatorDingAudio.play().catch(() => {});
    } catch (e) {}
}

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

async function fetchFileWithFallbacks(filename) {
    // Resolve absolute path relative to current page directory
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    const candidatePaths = [
        `archives/${filename}`,
        `./archives/${filename}`,
        `${basePath}archives/${filename}`,
        `/${filename}`,
        filename
    ];

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                const text = await res.text();
                try {
                    const parsedData = JSON.parse(text);
                    console.log(`[Terrace Vault] Successfully loaded: ${path}`);
                    return parsedData;
                } catch (jsonErr) {
                    console.error(`[Terrace Vault] JSON syntax error in ${path}:`, jsonErr);
                }
            }
        } catch (e) {
            // Path attempt failed, continue to next fallback
        }
    }
    return null;
}

async function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading archives...</div>';

    const foundArchives = [];

    for (let archiveId = 1; archiveId <= 20; archiveId++) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox-terrace.${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);

        if (data) {
            foundArchives.push({ paddedId, data });
        }
    }

    vaultList.innerHTML = '';

    if (foundArchives.length === 0) {
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No archives found in /archives.</div>';
        return;
    }

    foundArchives.forEach(({ paddedId, data }) => {
        const btn = document.createElement('button');
        btn.className = 'vault-item-btn';
        btn.innerHTML = `<strong>Archive ${paddedId}</strong>`;
        btn.onclick = () => {
            triggerHaptic(15);
            loadVaultSet(paddedId, data);
        };
        vaultList.appendChild(btn);
    });
}

function normalizeQuestions(data) {
    let rawList = [];
    if (!data) return generateFallbackQuestions();
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data.questions)) rawList = data.questions;
    else return generateFallbackQuestions();

    return rawList.map(q => {
        const opts = Array.isArray(q.options) ? [...q.options] : ["Option A", "Option B", "Option C", "Option D"];
        let correctAns = q.answer || q.correct;
        if (correctAns === undefined && typeof q.correctIndex === 'number' && opts[q.correctIndex] !== undefined) {
            correctAns = opts[q.correctIndex];
        }
        return {
            question: q.question || "Question missing",
            options: opts,
            answer: correctAns || opts[0]
        };
    });
}

async function startDailyClimb() {
    let data = await fetchFileWithFallbacks('terrace-questions.json');
    gameState.questions = normalizeQuestions(data);
    
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('gameplay-header').style.display = 'flex';
    document.getElementById('floor-hud-container').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'flex';

    startGame();
}

function loadVaultSet(paddedId, data) {
    gameState.questions = normalizeQuestions(data);
    closeModal('modal-vault');

    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('gameplay-header').style.display = 'flex';
    document.getElementById('floor-hud-container').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'flex';

    startGame();
}

function startGame() {
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
    const totalDuration = 30000; // 30 seconds
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
        msgEl.innerHTML = '<span class="congrats-green">Congratulations!</span> You\'ve cleared the Terrace and reached the 11th Floor.<br><br>Come back tomorrow to continue your streak.';
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
}// 11th Floor Terrace — Daily Premier League Engine

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
    } catch (e) {}
}

function saveStats() {
    try {
        localStorage.setItem('11fl_terrace_stats', JSON.stringify(gameState.stats));
    } catch (e) {}
}

loadSavedStats();

const elevatorDingAudio = new Audio();
elevatorDingAudio.src = 'ding.mp3';

function playElevatorDing() {
    if (!gameState.soundEnabled) return;
    try {
        elevatorDingAudio.currentTime = 0;
        elevatorDingAudio.play().catch(() => {});
    } catch (e) {}
}

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
            if (res.ok) {
                const parsed = await res.json();
                console.log(`[Terrace Vault] Successfully loaded: ${path}`);
                return parsed;
            }
        } catch (e) {
            console.warn(`[Terrace Vault] Could not parse JSON from ${path}:`, e);
        }
    }
    return null;
}

async function populateVault() {
    const vaultList = document.getElementById('vault-list');
    if (!vaultList) return;
    vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading archives...</div>';

    const foundArchives = [];

    for (let archiveId = 1; archiveId <= 20; archiveId++) {
        const paddedId = String(archiveId).padStart(2, '0');
        const filename = `sandbox-terrace.${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);

        if (data) {
            foundArchives.push({ paddedId, data });
        }
    }

    vaultList.innerHTML = '';

    if (foundArchives.length === 0) {
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No archives found in /archives.</div>';
        return;
    }

    foundArchives.forEach(({ paddedId, data }) => {
        const btn = document.createElement('button');
        btn.className = 'vault-item-btn';
        btn.innerHTML = `<strong>Archive ${paddedId}</strong>`;
        btn.onclick = () => {
            triggerHaptic(15);
            loadVaultSet(paddedId, data);
        };
        vaultList.appendChild(btn);
    });
}

function normalizeQuestions(data) {
    let rawList = [];
    if (!data) return generateFallbackQuestions();
    if (Array.isArray(data)) rawList = data;
    else if (Array.isArray(data.questions)) rawList = data.questions;
    else return generateFallbackQuestions();

    return rawList.map(q => {
        const opts = Array.isArray(q.options) ? [...q.options] : ["Option A", "Option B", "Option C", "Option D"];
        let correctAns = q.answer || q.correct;
        if (correctAns === undefined && typeof q.correctIndex === 'number' && opts[q.correctIndex] !== undefined) {
            correctAns = opts[q.correctIndex];
        }
        return {
            question: q.question || "Question missing",
            options: opts,
            answer: correctAns || opts[0]
        };
    });
}

async function startDailyClimb() {
    let data = await fetchFileWithFallbacks('terrace-questions.json');
    gameState.questions = normalizeQuestions(data);
    
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('gameplay-header').style.display = 'flex';
    document.getElementById('floor-hud-container').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'flex';

    startGame();
}

function loadVaultSet(paddedId, data) {
    gameState.questions = normalizeQuestions(data);
    closeModal('modal-vault');

    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('gameplay-header').style.display = 'flex';
    document.getElementById('floor-hud-container').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'flex';

    startGame();
}

function startGame() {
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
    const totalDuration = 30000; // 30 seconds
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
        msgEl.innerHTML = '<span class="congrats-green">Congratulations!</span> You\'ve cleared the Terrace and reached the 11th Floor.<br><br>Come back tomorrow to continue your streak.';
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
