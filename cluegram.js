// ==========================================================================
// 11th Floor Cluegram — Core Interactive Game Engine & Archive Integration
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Current Game State Variables
    let currentFloorIndex = 0; // 0 = 1st Floor, 9 = 10th Floor
    let userGuess = [];
    let rackTiles = [];
    let isProcessing = false;
    let soundEnabled = true;
    let activeGameData = [];
    
    // Timer Variables
    let startTime = 0;
    let timerInterval = null;
    let timeElapsedSeconds = 0;

    // Local Storage Player Stats Key
    const STATS_KEY = '11th_floor_cluegram_stats';

    // DOM Element References
    const startScreen = document.getElementById('start-screen');
    const startClimbBtn = document.getElementById('start-climb-btn');
    const hudContainer = document.getElementById('floor-hud-container');
    const gameWorkspace = document.getElementById('game-workspace');
    const gameControls = document.getElementById('game-controls');
    const gameplayHeader = document.getElementById('gameplay-header');
    
    const victoryScreen = document.getElementById('victory-screen');
    const victoryStatsBtn = document.getElementById('btn-victory-stats');
    const victoryTimeDisplay = document.getElementById('victory-time-display');
    const victoryStreakDisplay = document.getElementById('victory-streak-display');
    const activeGameTimer = document.getElementById('active-game-timer');
    const footerText = document.getElementById('footer-text');
    
    const floorNumberVal = document.getElementById('floor-number-val');
    const floorRuleText = document.getElementById('floor-rule-text');
    const clueText = document.getElementById('clue-text');
    const targetSlotsContainer = document.getElementById('target-word-slots');
    const letterRackContainer = document.getElementById('letter-rack');
    const messageBox = document.getElementById('message-box');

    const backspaceBtn = document.getElementById('action-backspace-btn');
    const shuffleBtn = document.getElementById('action-shuffle-btn');
    const submitBtn = document.getElementById('action-submit-btn');

    const statsModal = document.getElementById('modal-vault');
    const statsBtn = document.getElementById('btn-landing-stats');
    const closeVaultBtn = document.getElementById('btn-close-vault');
    const soundBtn = document.getElementById('btn-sound');
    const vaultList = document.getElementById('vault-list');

    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];

    // Initialize Game Engine
    init();

    function init() {
        if (window.CLUEGRAM_DAILY_SET) {
            activeGameData = Array.isArray(window.CLUEGRAM_DAILY_SET) 
                ? window.CLUEGRAM_DAILY_SET 
                : (window.CLUEGRAM_DAILY_SET.floors || []);
        } else {
            activeGameData = [];
        }
        
        bindEvents();
        updateStatsDisplay();
    }

    function bindEvents() {
        if (startClimbBtn) startClimbBtn.addEventListener('click', startGame);
        if (backspaceBtn) backspaceBtn.addEventListener('click', handleBackspace);
        if (shuffleBtn) shuffleBtn.addEventListener('click', handleShuffle);
        if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                if (statsModal) statsModal.classList.remove('hidden');
                populateVault();
            });
        }

        if (victoryStatsBtn) {
            victoryStatsBtn.addEventListener('click', () => {
                if (statsModal) statsModal.classList.remove('hidden');
                populateVault();
            });
        }

        if (closeVaultBtn) {
            closeVaultBtn.addEventListener('click', () => {
                if (statsModal) statsModal.classList.add('hidden');
                if (victoryScreen && victoryScreen.style.display !== 'none') {
                    resetToStartScreen();
                }
            });
        }

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                soundEnabled = !soundEnabled;
                soundBtn.textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
            });
        }

        document.addEventListener('keydown', (e) => {
            if (!gameWorkspace || gameWorkspace.style.display === 'none' || isProcessing) return;

            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                selectFirstAvailableLetter(key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                handleSubmit();
            }
        });
    }

    // --- Timer Functions ---
    function startTimer() {
        stopTimer();
        timeElapsedSeconds = 0;
        startTime = Date.now();
        if (activeGameTimer) {
            activeGameTimer.style.display = 'block';
            activeGameTimer.textContent = '00:00';
        }
        timerInterval = setInterval(updateTimerDisplay, 1000);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    function updateTimerDisplay() {
        timeElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (activeGameTimer) {
            activeGameTimer.textContent = formatTime(timeElapsedSeconds);
        }
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // --- Data Loading ---
    function fetchFileWithFallbacks(filename) {
        const candidatePaths = [`./archives/${filename}`, `./${filename}`, `./data/${filename}`, filename];
        return new Promise(async (resolve) => {
            for (const path of candidatePaths) {
                try {
                    const res = await fetch(path);
                    if (res.ok) return resolve(await res.json());
                } catch (e) {}
            }
            resolve(null);
        });
    }

    async function populateVault() {
        if (!vaultList) return;
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading Archives...</div>';
        
        const fetchPromises = [];
        for (let i = 1; i <= 51; i++) {
            const paddedId = String(i).padStart(2, '0');
            fetchPromises.push(fetchFileWithFallbacks(`cluegram-${paddedId}.json`).then(data => ({ id: paddedId, data })));
        }

        const results = await Promise.all(fetchPromises);
        const buttons = [];

        results.forEach(({ id, data }) => {
            if (data) {
                const btn = document.createElement('button');
                btn.className = 'vault-item-btn';
                btn.innerHTML = `<strong>Archive ${id}</strong>`;
                btn.onclick = () => loadVaultArchive(id);
                buttons.push(btn);
            }
        });

        vaultList.innerHTML = '';
        if (buttons.length === 0) {
            vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No archives found.</div>';
        } else {
            buttons.forEach(btn => vaultList.appendChild(btn));
        }
    }

    async function loadVaultArchive(paddedId) {
        const data = await fetchFileWithFallbacks(`cluegram-${paddedId}.json`);
        let extractedFloors = [];
        if (data) extractedFloors = Array.isArray(data) ? data : (data.floors || []);

        if (extractedFloors.length > 0) {
            activeGameData = extractedFloors;
            launchGameUI();
        } else {
            showMessage(`COULD NOT LOAD ARCHIVE ${paddedId}`, false);
        }
    }

    function startGame() {
        if (!activeGameData || activeGameData.length === 0) {
            if (window.CLUEGRAM_DAILY_SET) {
                activeGameData = Array.isArray(window.CLUEGRAM_DAILY_SET) 
                    ? window.CLUEGRAM_DAILY_SET 
                    : (window.CLUEGRAM_DAILY_SET.floors || []);
            }
        }
        if (!activeGameData || activeGameData.length === 0) return;
        launchGameUI();
    }

    function launchGameUI() {
        if (startScreen) startScreen.style.display = 'none';
        if (victoryScreen) victoryScreen.style.display = 'none';
        if (hudContainer) hudContainer.style.display = 'flex';
        if (gameWorkspace) gameWorkspace.style.display = 'flex';
        if (gameControls) gameControls.style.display = 'flex';
        if (statsModal) statsModal.classList.add('hidden');
        if (gameplayHeader) gameplayHeader.style.display = 'flex';
        if (footerText) footerText.style.display = 'block';

        currentFloorIndex = 0;
        startTimer();
        loadFloor(currentFloorIndex);
    }

    function resetToStartScreen() {
        if (victoryScreen) victoryScreen.style.display = 'none';
        if (hudContainer) hudContainer.style.display = 'none';
        if (gameWorkspace) gameWorkspace.style.display = 'none';
        if (gameControls) gameControls.style.display = 'none';
        if (gameplayHeader) gameplayHeader.style.display = 'none';
        if (activeGameTimer) activeGameTimer.style.display = 'none';
        if (startScreen) startScreen.style.display = 'flex';
    }

    // --- Core Logic ---
    function getOrdinalFloorHTML(floorNum) {
        const ord = ordinals[floorNum - 1] || `${floorNum}th`;
        return `<span style="color: var(--genre-magenta);">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
    }

    function loadFloor(index) {
        if (!activeGameData || index >= activeGameData.length) return;

        const floorData = activeGameData[index];
        userGuess = [];
        showMessage('', false);
        isProcessing = false;

        if (floorNumberVal) floorNumberVal.innerHTML = getOrdinalFloorHTML(index + 1);
        if (floorRuleText) floorRuleText.textContent = `${floorData.target.length}-letter Anagram • No mistakes!`;
        if (clueText) clueText.textContent = floorData.clue;

        updateTowerStack(index + 1);

        if (targetSlotsContainer) {
            targetSlotsContainer.innerHTML = '';
            for (let i = 0; i < floorData.target.length; i++) {
                const slot = document.createElement('div');
                slot.className = 'target-slot';
                slot.dataset.slotIndex = i;
                slot.addEventListener('click', () => handleSlotClick(i));
                targetSlotsContainer.appendChild(slot);
            }
        }

        rackTiles = floorData.scrambled.split('').map((char, i) => ({
            id: i,
            letter: char,
            used: false
        }));

        renderRack();
    }

    function renderRack() {
        if (!letterRackContainer) return;
        letterRackContainer.innerHTML = '';
        rackTiles.forEach((tile) => {
            const tileElem = document.createElement('div');
            tileElem.className = `rack-tile ${tile.used ? 'used' : ''}`;
            tileElem.textContent = tile.letter;
            tileElem.addEventListener('click', () => handleTileClick(tile));
            letterRackContainer.appendChild(tileElem);
        });
        renderTargetSlots();
    }

    function renderTargetSlots() {
        if (!targetSlotsContainer) return;
        const slots = targetSlotsContainer.querySelectorAll('.target-slot');
        slots.forEach((slot, i) => {
            if (i < userGuess.length) {
                slot.textContent = userGuess[i].letter;
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
            slot.classList.remove('state-error', 'state-success');
        });
    }

    function handleTileClick(tile) {
        if (tile.used || isProcessing) return;
        const currentFloor = activeGameData[currentFloorIndex];
        if (userGuess.length < currentFloor.target.length) {
            tile.used = true;
            userGuess.push(tile);
            renderRack();
        }
    }

    function handleSlotClick(index) {
        if (isProcessing || index >= userGuess.length) return;
        const removedTile = userGuess.splice(index, 1)[0];
        const originalTile = rackTiles.find(t => t.id === removedTile.id);
        if (originalTile) originalTile.used = false;
        renderRack();
    }

    function selectFirstAvailableLetter(letter) {
        const availableTile = rackTiles.find(t => !t.used && t.letter === letter);
        if (availableTile) handleTileClick(availableTile);
    }

    function handleBackspace() {
        if (userGuess.length === 0 || isProcessing) return;
        const removedTile = userGuess.pop();
        const originalTile = rackTiles.find(t => t.id === removedTile.id);
        if (originalTile) originalTile.used = false;
        renderRack();
    }

    function handleShuffle() {
        if (isProcessing) return;
        for (let i = rackTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rackTiles[i], rackTiles[j]] = [rackTiles[j], rackTiles[i]];
        }
        renderRack();
    }

    function handleSubmit() {
        if (isProcessing) return;
        const currentFloor = activeGameData[currentFloorIndex];
        if (userGuess.length < currentFloor.target.length) {
            showMessage('FILL ALL SLOTS BEFORE SUBMITTING', false);
            return;
        }

        isProcessing = true;
        const submittedWord = userGuess.map(t => t.letter).join('');
        const slots = targetSlotsContainer.querySelectorAll('.target-slot');

        if (submittedWord === currentFloor.target) {
            slots.forEach(slot => slot.classList.add('state-success'));
            showMessage('CORRECT ANAGRAM!', true);

            setTimeout(() => {
                if (currentFloorIndex + 1 >= activeGameData.length) {
                    stopTimer();
                    const newStats = recordGameResult(true, 11);
                    
                    if (victoryTimeDisplay) victoryTimeDisplay.textContent = formatTime(timeElapsedSeconds);
                    if (victoryStreakDisplay) victoryStreakDisplay.textContent = `${newStats.streak} Days`;
                    
                    if (hudContainer) hudContainer.style.display = 'none';
                    if (gameWorkspace) gameWorkspace.style.display = 'none';
                    if (gameControls) gameControls.style.display = 'none';
                    if (gameplayHeader) gameplayHeader.style.display = 'none';
                    if (activeGameTimer) activeGameTimer.style.display = 'none';
                    if (footerText) footerText.style.display = 'none';
                    
                    if (victoryScreen) victoryScreen.style.display = 'flex';
                    
                } else {
                    currentFloorIndex++;
                    loadFloor(currentFloorIndex);
                }
            }, 800);
        } else {
            slots.forEach(slot => slot.classList.add('state-error'));
            showMessage('INCORRECT — DROPPED TO 1ST FLOOR', false);

            const towerFloors = document.querySelectorAll('.tower-floor');
            const activeTowerFloor = Array.from(towerFloors).find(
                f => parseInt(f.dataset.floor) === currentFloorIndex + 1
            );
            if (activeTowerFloor) activeTowerFloor.classList.add('failed');

            stopTimer();
            recordGameResult(false, currentFloorIndex + 1);

            setTimeout(() => {
                currentFloorIndex = 0;
                startTimer();
                loadFloor(0);
            }, 1500);
        }
    }

    function updateTowerStack(activeFloorNum) {
        const towerFloors = document.querySelectorAll('.tower-floor');
        towerFloors.forEach(floorElem => {
            const floorVal = parseInt(floorElem.dataset.floor);
            floorElem.classList.remove('active', 'completed', 'failed');

            if (floorVal === activeFloorNum) {
                floorElem.classList.add('active');
            } else if (floorVal < activeFloorNum) {
                floorElem.classList.add('completed');
            }
        });
    }

    function showMessage(msg, isSuccess = false) {
        if (!messageBox) return;
        messageBox.textContent = msg;
        messageBox.style.color = isSuccess ? 'var(--state-success)' : 'var(--state-error)';
    }

    function recordGameResult(isWin, peakFloor) {
        const stats = getStats();
        stats.played++;
        if (isWin) {
            stats.wins++;
            stats.streak++;
        } else {
            stats.streak = 0;
        }

        if (peakFloor > stats.bestFloor) {
            stats.bestFloor = peakFloor;
        }

        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        updateStatsDisplay();
        return stats;
    }

    function getStats() {
        const raw = localStorage.getItem(STATS_KEY);
        if (!raw) {
            return { played: 0, wins: 0, streak: 0, bestFloor: 1 };
        }
        return JSON.parse(raw);
    }

    function updateStatsDisplay() {
        const stats = getStats();
        const playedElem = document.getElementById('stat-played');
        const winsElem = document.getElementById('stat-wins');
        const winrateElem = document.getElementById('stat-winrate');
        const streakElem = document.getElementById('stat-streak');
        const bestfloorElem = document.getElementById('stat-bestfloor');

        if (playedElem) playedElem.textContent = stats.played;
        if (winsElem) winsElem.textContent = stats.wins;
        
        const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        if (winrateElem) winrateElem.textContent = `${winRate}%`;
        if (streakElem) streakElem.textContent = stats.streak;
        
        const bestOrd = ordinals[stats.bestFloor - 1] || `${stats.bestFloor}th`;
        if (bestfloorElem) bestfloorElem.textContent = `${bestOrd} Floor`;
    }
});
