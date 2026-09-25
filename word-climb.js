/* ==========================================
   ELEVENTH FLOOR WORD CLIMB - GAME LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameCard = document.getElementById('game-card');
    
    const floorTag = document.getElementById('floor-tag');
    const targetWordEl = document.getElementById('target-word');
    const startWordEl = document.getElementById('start-word');
    const wordHistoryEl = document.getElementById('word-history');
    
    const wordInput = document.getElementById('word-input');
    const submitBtn = document.getElementById('submit-word-btn');
    const messageDisplay = document.getElementById('message-display');
    
    const floorBlocks = document.querySelectorAll('.floor-block');
    
    // Modals
    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    const closeStatsBtn = document.getElementById('close-stats-btn');
    
    const victoryModal = document.getElementById('victory-modal');
    const closeVictoryBtn = document.getElementById('close-victory-btn');

    // Stats Elements
    const statPlayed = document.getElementById('stat-played');
    const statWins = document.getElementById('stat-wins');
    const statWinPct = document.getElementById('stat-win-pct');
    const statStreak = document.getElementById('stat-streak');
    const statBest = document.getElementById('stat-best');

    // Game State
    let currentFloor = 1;
    let wordLadder = [];
    let currentWord = "";
    let targetWord = "";
    let history = [];

    // LocalStorage Keys
    const STATS_KEY = '11fl_wordclimb_stats';

    // Default Word Sequences (11 Floors = 10 Transitions)
    const fallbackLadders = [
        ["COLD", "CORD", "CARD", "WARD", "WARM", "WORM", "WORD", "WOOD", "GOOD", "GOAD", "GOAL"],
        ["LEAD", "LOAD", "GOAD", "GOAL", "FOAL", "FOAM", "FORM", "FIRM", "FIRE", "FINE", "FIND"],
        ["HEAD", "HEAL", "TEAL", "TEAM", "TRAM", "TRAP", "TRIP", "DRIP", "DROP", "CROP", "CROW"]
    ];

    function getDictionary() {
        if (typeof WORDS !== 'undefined' && Array.isArray(WORDS) && WORDS.length > 0) {
            return WORDS.map(w => w.toUpperCase());
        }
        return [];
    }

    function initGame() {
        currentFloor = 1;
        const selectedLadder = fallbackLadders[Math.floor(Math.random() * fallbackLadders.length)];
        wordLadder = selectedLadder;
        currentWord = wordLadder[0];
        targetWord = wordLadder[10];
        history = [currentWord];

        updateUI();
        if (messageDisplay) messageDisplay.textContent = "";
        if (wordInput) wordInput.value = "";
    }

    function updateUI() {
        // Update Floor Tag
        if (floorTag) {
            floorTag.textContent = `FLOOR ${String(currentFloor).padStart(2, '0')}`;
        }

        // Update Target & Start Words
        if (targetWordEl) targetWordEl.textContent = targetWord;
        if (startWordEl) startWordEl.textContent = wordLadder[0];

        // Render Word History
        if (wordHistoryEl) {
            wordHistoryEl.innerHTML = history.map((w, idx) => {
                const floorNum = String(idx + 1).padStart(2, '0');
                return `<div class="word-step">F${floorNum}: ${w}</div>`;
            }).join('');
            wordHistoryEl.scrollTop = wordHistoryEl.scrollHeight;
        }

        // Update Elevator Shaft
        floorBlocks.forEach(block => {
            const f = parseInt(block.getAttribute('data-floor'), 10);
            block.classList.remove('active', 'completed');
            if (f === currentFloor) {
                block.classList.add('active');
            } else if (f < currentFloor) {
                block.classList.add('completed');
            }
        });
    }

    function isOneLetterDifference(word1, word2) {
        if (word1.length !== word2.length) return false;
        let diffs = 0;
        for (let i = 0; i < word1.length; i++) {
            if (word1[i] !== word2[i]) diffs++;
        }
        return diffs === 1;
    }

    function isValidWord(word) {
        const dict = getDictionary();
        if (dict.length > 0) {
            return dict.includes(word);
        }
        return word.length === currentWord.length;
    }

    function handleWordSubmit() {
        if (!wordInput) return;
        const inputVal = wordInput.value.trim().toUpperCase();
        wordInput.value = "";

        if (!inputVal) {
            showMessage("Please enter a word.");
            return;
        }

        if (inputVal.length !== currentWord.length) {
            showMessage(`Word must be ${currentWord.length} letters long.`);
            return;
        }

        if (inputVal === currentWord) {
            showMessage("Word matches current word.");
            return;
        }

        if (!isOneLetterDifference(currentWord, inputVal)) {
            showMessage("Change exactly ONE letter.");
            return;
        }

        if (!isValidWord(inputVal)) {
            showMessage("Word not in dictionary.");
            return;
        }

        // Advance Floor
        currentWord = inputVal;
        history.push(currentWord);
        currentFloor++;

        showMessage("");
        updateUI();

        // Check Victory
        if (currentFloor === 11 || currentWord === targetWord) {
            handleVictory();
        }
    }

    function showMessage(msg) {
        if (messageDisplay) {
            messageDisplay.textContent = msg;
        }
    }

    function handleVictory() {
        currentFloor = 11;
        updateUI();
        saveStats(true);
        if (victoryModal) {
            victoryModal.classList.remove('hidden');
        }
    }

    // Stats Management
    function loadStats() {
        const data = localStorage.getItem(STATS_KEY);
        if (data) {
            try { return JSON.parse(data); } catch (e) { }
        }
        return { played: 0, wins: 0, streak: 0, bestPeak: 1 };
    }

    function saveStats(won) {
        const stats = loadStats();
        stats.played++;
        if (won) {
            stats.wins++;
            stats.streak++;
            stats.bestPeak = 11;
        } else {
            stats.streak = 0;
            if (currentFloor > stats.bestPeak) {
                stats.bestPeak = currentFloor;
            }
        }
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function renderStats() {
        const stats = loadStats();
        if (statPlayed) statPlayed.textContent = stats.played;
        if (statWins) statWins.textContent = stats.wins;
        if (statWinPct) {
            const pct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
            statWinPct.textContent = `${pct}%`;
        }
        if (statStreak) statStreak.textContent = stats.streak;
        if (statBest) statBest.textContent = stats.bestPeak;
    }

    // Event Listeners
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (startScreen) startScreen.classList.add('hidden');
            if (gameCard) gameCard.classList.remove('hidden');
            initGame();
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', handleWordSubmit);
    }

    if (wordInput) {
        wordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleWordSubmit();
            }
        });
    }

    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            renderStats();
            if (statsModal) statsModal.classList.remove('hidden');
        });
    }

    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            if (statsModal) statsModal.classList.add('hidden');
        });
    }

    if (closeVictoryBtn) {
        closeVictoryBtn.addEventListener('click', () => {
            if (victoryModal) victoryModal.classList.add('hidden');
        });
    }
});
