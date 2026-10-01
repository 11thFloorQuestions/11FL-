// ==========================================================================
// 11th Floor Parity — Core Engine & Matching Rules
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    let currentFloorIndex = 0;
    let selectedTiles = [];
    let matchedPairsCount = 0;
    let isProcessing = false;
    let soundEnabled = true;
    let activeGameData = [];
    let timerInterval = null;
    let timeRemaining = 0;
    let totalFloorTime = 0;

    const STATS_KEY = '11th_floor_parity_stats';

    const startScreen = document.getElementById('start-screen');
    const startClimbBtn = document.getElementById('start-climb-btn');
    const gameplayHeader = document.getElementById('gameplay-header');
    const hudContainer = document.getElementById('floor-hud-container');
    const gameWorkspace = document.getElementById('game-workspace');

    const floorNumberVal = document.getElementById('floor-number-val');
    const floorRuleText = document.getElementById('floor-rule-text');
    const parityGrid = document.getElementById('parity-grid');
    const messageBox = document.getElementById('message-box');
    const timerBarFill = document.getElementById('timer-bar-fill');

    const statsModal = document.getElementById('modal-vault');
    const statsBtn = document.getElementById('btn-landing-stats');
    const closeVaultBtn = document.getElementById('btn-close-vault');
    const soundBtn = document.getElementById('btn-sound');
    const vaultList = document.getElementById('vault-list');

    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];

    init();

    function init() {
        activeGameData = window.PARITY_DAILY_SET ? window.PARITY_DAILY_SET.floors : [];
        bindEvents();
        updateStatsDisplay();
    }

    function bindEvents() {
        startClimbBtn.addEventListener('click', startGame);

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
    }

    function startGame() {
        if (!activeGameData || activeGameData.length === 0) {
            activeGameData = window.PARITY_DAILY_SET ? window.PARITY_DAILY_SET.floors : [];
        }

        startScreen.style.display = 'none';
        gameplayHeader.style.display = 'flex';
        hudContainer.style.display = 'flex';
        gameWorkspace.style.display = 'flex';

        currentFloorIndex = 0;
        loadFloor(currentFloorIndex);
    }

    function getOrdinalFloorHTML(floorNum) {
        const ord = ordinals[floorNum - 1] || `${floorNum}th`;
        return `<span style="color: var(--genre-pink);">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
    }

    function loadFloor(index) {
        if (!activeGameData || index >= activeGameData.length) return;

        clearInterval(timerInterval);
        const floorData = activeGameData[index];
        selectedTiles = [];
        matchedPairsCount = 0;
        isProcessing = false;
        showMessage('');

        floorNumberVal.innerHTML = getOrdinalFloorHTML(index + 1);

        // Starter prompt phrasing on Floor 1 vs standard rule text on higher floors
        if (index === 0) {
            floorRuleText.textContent = `1 PAIR • TAP ANY TILE TO REVEAL`;
        } else {
            floorRuleText.textContent = `${floorData.pairs} Pair${floorData.pairs > 1 ? 's' : ''} • Clear Grid Before Time Expires!`;
        }

        updateTowerStack(index + 1);
        buildGrid(floorData, index === 0);
        startTimer(floorData.timeLimit);
    }

    function buildGrid(floorData, isFirstFloor) {
        parityGrid.innerHTML = '';
        const icons = floorData.icons.slice(0, floorData.pairs);
        const deck = [...icons, ...icons];

        // Shuffle deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // Configure optimal column counts for screen fitting
        const count = deck.length;
        if (count <= 4) {
            parityGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            parityGrid.style.gap = '8px';
        } else if (count <= 12) {
            parityGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            parityGrid.style.gap = '6px';
        } else if (count <= 16) {
            parityGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            parityGrid.style.gap = '5px';
        } else {
            parityGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            parityGrid.style.gap = '4px';
        }

        deck.forEach((iconKey, index) => {
            const tile = document.createElement('div');
            tile.className = 'parity-tile face-down';
            
            // Add starter pulse cue to tile 0 on floor 1
            if (isFirstFloor && index === 0) {
                tile.classList.add('pulse-hint');
            }

            tile.dataset.icon = iconKey;
            tile.dataset.index = index;
            tile.innerHTML = window.PARITY_DAILY_SET.svgMap[iconKey] || '';
            tile.addEventListener('click', () => handleTileClick(tile));
            parityGrid.appendChild(tile);
        });
    }

    function startTimer(seconds) {
        timeRemaining = seconds;
        totalFloorTime = seconds;
        updateTimerBar();

        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            updateTimerBar();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                handleFloorFailure('TIME EXPIRED — DROPPED TO 1ST FLOOR');
            }
        }, 100);
    }

    function updateTimerBar() {
        const pct = Math.max(0, (timeRemaining / totalFloorTime) * 100);
        timerBarFill.style.width = `${pct}%`;
    }

    function handleTileClick(tile) {
        if (isProcessing || tile.classList.contains('matched') || tile.classList.contains('selected') || selectedTiles.length >= 2) {
            return;
        }

        // Remove pulse hint on tap
        document.querySelectorAll('.parity-tile.pulse-hint').forEach(t => t.classList.remove('pulse-hint'));

        tile.classList.remove('face-down');
        tile.classList.add('selected');
        selectedTiles.push(tile);

        if (selectedTiles.length === 2) {
            isProcessing = true;
            checkMatch();
        }
    }

    function checkMatch() {
        const [tile1, tile2] = selectedTiles;

        if (tile1.dataset.icon === tile2.dataset.icon) {
            tile1.classList.remove('selected');
            tile2.classList.remove('selected');
            tile1.classList.add('matched');
            tile2.classList.add('matched');

            matchedPairsCount++;
            selectedTiles = [];
            isProcessing = false;

            const floorData = activeGameData[currentFloorIndex];
            if (matchedPairsCount === floorData.pairs) {
                clearInterval(timerInterval);
                showMessage('PARITY MATCHED!');

                setTimeout(() => {
                    if (currentFloorIndex + 1 >= activeGameData.length) {
                        recordGameResult(true, 11);
                        showMessage('CONGRATULATIONS! 11TH FLOOR REACHED!');
                        setTimeout(() => {
                            currentFloorIndex = 0;
                            loadFloor(0);
                        }, 2000);
                    } else {
                        currentFloorIndex++;
                        loadFloor(currentFloorIndex);
                    }
                }, 800);
            }
        } else {
            tile1.classList.add('error');
            tile2.classList.add('error');

            setTimeout(() => {
                tile1.classList.remove('selected', 'error');
                tile2.classList.remove('selected', 'error');
                tile1.classList.add('face-down');
                tile2.classList.add('face-down');

                selectedTiles = [];
                isProcessing = false;
            }, 600);
        }
    }

    function handleFloorFailure(reason) {
        isProcessing = true;
        showMessage(reason);

        const towerFloors = document.querySelectorAll('.tower-floor');
        const activeTowerFloor = Array.from(towerFloors).find(
            f => parseInt(f.dataset.floor) === currentFloorIndex + 1
        );
        if (activeTowerFloor) activeTowerFloor.classList.add('failed');

        recordGameResult(false, currentFloorIndex + 1);

        setTimeout(() => {
            currentFloorIndex = 0;
            loadFloor(0);
        }, 1500);
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
        document.getElementById('stat-streak').textContent = `${stats.streak}`;

        const bestOrd = ordinals[stats.bestFloor - 1] || `${stats.bestFloor}th`;
        document.getElementById('stat-bestfloor').textContent = `${bestOrd} Floor`;
    }

    async function populateVault() {
        if (!vaultList) return;
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Archive Vault Coming Soon</div>';
    }
});
