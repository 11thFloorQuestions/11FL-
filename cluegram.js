// ==========================================================================
// 11th Floor Cluegram — Core Interactive Game Engine & Archive Integration
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Current Game State Variables
    let currentFloorIndex = 0; // 0 = Floor 1, 9 = Floor 10
    let userGuess = [];
    let rackTiles = [];
    let isProcessing = false;
    let soundEnabled = true;
    let activeGameData = [];

    // Local Storage Player Stats Key
    const STATS_KEY = '11th_floor_cluegram_stats';

    // DOM Element References
    const startScreen = document.getElementById('start-screen');
    const startClimbBtn = document.getElementById('start-climb-btn');
    const hudContainer = document.getElementById('floor-hud-container');
    const gameWorkspace = document.getElementById('game-workspace');
    const gameControls = document.getElementById('game-controls');
    
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

    // Initialize Game Engine
    init();

    function init() {
        // Default to daily puzzle dataset
        activeGameData = window.CLUEGRAM_DAILY_SET ? window.CLUEGRAM_DAILY_SET.floors : [];
        bindEvents();
        updateStatsDisplay();
    }

    function bindEvents() {
        startClimbBtn.addEventListener('click', startGame);
        backspaceBtn.addEventListener('click', handleBackspace);
        shuffleBtn.addEventListener('click', handleShuffle);
        submitBtn.addEventListener('click', handleSubmit);

        statsBtn.addEventListener('click', () => {
            statsModal.classList.remove('hidden');
            populateVault();
        });

        closeVaultBtn.addEventListener('click', () => {
            statsModal.classList.add('hidden');
        });

        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
        });

        // Global Keyboard Inputs
        document.addEventListener('keydown', (e) => {
            if (gameWorkspace.style.display === 'none' || isProcessing) return;

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

    // Dynamic file loader with fallback path resolution
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
                    return await res.json();
                }
            } catch (e) {}
        }
        return null;
    }

    async function populateVault() {
        if (!vaultList) return;

        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading Archives...</div>';
        
        const MAX_ARCHIVES = 50;
        const fetchPromises = [];

        for (let i = 1; i <= MAX_ARCHIVES; i++) {
            const paddedId = String(i).padStart(2, '0');
            const filename = `cluegram-${paddedId}.json`;
            fetchPromises.push(
                fetchFileWithFallbacks(filename).then(data => ({ id: paddedId, data }))
            );
        }

        const results = await Promise.all(fetchPromises);
        const buttons = [];

        results.forEach(({ id, data }) => {
            if (data) {
                const btn = document.createElement('button');
                btn.className = 'vault-item-btn';
                btn.innerHTML = `<strong>Archive ${id}</strong>`;
                btn.onclick = () => {
                    loadVaultArchive(id);
                };
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
        const filename = `cluegram-${paddedId}.json`;
        const data = await fetchFileWithFallbacks(filename);

        if (data && data.floors && data.floors.length > 0) {
            activeGameData = data.floors;

            if (startScreen) startScreen.style.display = 'none';
            if (hudContainer) hudContainer.style.display = 'flex';
            if (gameWorkspace) gameWorkspace.style.display = 'flex';
            if (gameControls) gameControls.style.display = 'flex';
            if (statsModal) statsModal.classList.add('hidden');

            currentFloorIndex = 0;
            loadFloor(currentFloorIndex);
        } else {
            alert(`Could not load Archive ${paddedId} (${filename}).`);
        }
    }

    function startGame() {
        // Fall back to daily puzzle set if non-archive climb is started
        if (!activeGameData || activeGameData.length === 0) {
            activeGameData = window.CLUEGRAM_DAILY_SET ? window.CLUEGRAM_DAILY_SET.floors : [];
        }

        startScreen.style.display = 'none';
        hudContainer.style.display = 'flex';
        gameWorkspace.style.display = 'flex';
        gameControls.style.display = 'flex';

        currentFloorIndex = 0;
        loadFloor(currentFloorIndex);
    }

    function loadFloor(index) {
        if (!activeGameData || index >= activeGameData.length) return;

        const floorData = activeGameData[index];
        userGuess = [];
        messageBox.textContent = '';
        isProcessing = false;

        // Update Floor Displays
        const formattedFloorNumber = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
        floorNumberVal.textContent = `FLOOR ${formattedFloorNumber}`;
        floorRuleText.textContent = `${floorData.target.length}-letter Anagram • No mistakes!`;
        clueText.textContent = floorData.clue;

        updateTowerStack(index + 1);

        // Build Target Answer Slots
        targetSlotsContainer.innerHTML = '';
        for (let i = 0; i < floorData.target.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'target-slot';
            slot.dataset.slotIndex = i;
            slot.addEventListener('click', () => handleSlotClick(i));
            targetSlotsContainer.appendChild(slot);
        }

        // Build Scrambled Rack
        rackTiles = floorData.scrambled.split('').map((char, i) => ({
            id: i,
            letter: char,
            used: false
        }));

        renderRack();
    }

    function renderRack() {
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

        // Remove tile from guess and un-use it in rack
        const removedTile = userGuess.splice(index, 1)[0];
        const originalTile = rackTiles.find(t => t.id === removedTile.id);
        if (originalTile) originalTile.used = false;

        renderRack();
    }

    function selectFirstAvailableLetter(letter) {
        const availableTile = rackTiles.find(t => !t.used && t.letter === letter);
        if (availableTile) {
            handleTileClick(availableTile);
        }
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

        // Fisher-Yates shuffle on rack tiles
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
            showMessage('FILL ALL SLOTS BEFORE SUBMITTING');
            return;
        }

        isProcessing = true;
        const submittedWord = userGuess.map(t => t.letter).join('');
        const slots = targetSlotsContainer.querySelectorAll('.target-slot');

        if (submittedWord === currentFloor.target) {
            // Success Feedback (Green)
            slots.forEach(slot => slot.classList.add('state-success'));
            showMessage('');

            setTimeout(() => {
                if (currentFloorIndex + 1 >= activeGameData.length) {
                    // Reached Floor 11 Victory
                    recordGameResult(true, 11);
                    alert("CONGRATULATIONS! YOU REACHED THE 11TH FLOOR!");
                    location.reload();
                } else {
                    currentFloorIndex++;
                    loadFloor(currentFloorIndex);
                }
            }, 800);
        } else {
            // Error Feedback (Red)
            slots.forEach(slot => slot.classList.add('state-error'));
            showMessage('INCORRECT ANAGRAM — ASCENT FAILED');

            const towerFloors = document.querySelectorAll('.tower-floor');
            const activeTowerFloor = Array.from(towerFloors).find(
                f => parseInt(f.dataset.floor) === currentFloorIndex + 1
            );
            if (activeTowerFloor) activeTowerFloor.classList.add('failed');

            recordGameResult(false, currentFloorIndex + 1);

            setTimeout(() => {
                alert(`Game Over! You were stopped on Floor ${currentFloorIndex + 1}.`);
                location.reload();
            }, 1200);
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

    function showMessage(msg) {
        messageBox.textContent = msg;
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
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = stats.wins;
        
        const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        document.getElementById('stat-winrate').textContent = `${winRate}%`;
        document.getElementById('stat-streak').textContent = stats.streak;
        
        const bestFormatted = stats.bestFloor < 10 ? `FL 0${stats.bestFloor}` : `FL ${stats.bestFloor}`;
        document.getElementById('stat-bestfloor').textContent = bestFormatted;
    }
});
