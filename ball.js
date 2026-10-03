// ==========================================================================
// 11th Floor TYKB — Core Engine, Timer Mechanics & Receipt Rendering
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    let currentFloorIndex = 0;
    let isProcessing = false;
    let soundEnabled = true;
    let activeDataSet = null;
    let activeGameData = [];
    let timerInterval = null;
    let timeRemaining = 0;
    let totalFloorTime = 0;

    // Overall Active Match Timer
    let gameStartTime = 0;
    let activeGameTimerInterval = null;
    let totalElapsedSeconds = 0;

    const STATS_KEY = '11th_floor_tykb_stats';

    const startScreen = document.getElementById('start-screen');
    const startClimbBtn = document.getElementById('start-climb-btn');
    const gameplayHeader = document.getElementById('gameplay-header');
    const hudContainer = document.getElementById('floor-hud-container');
    const gameWorkspace = document.getElementById('game-workspace');
    const victoryScreen = document.getElementById('victory-screen');

    const activeGameTimer = document.getElementById('active-game-timer');
    const receiptTagHeader = document.getElementById('receipt-tag-header');
    const receiptMainTitle = document.getElementById('receipt-main-title');
    const victoryFloorsDisplay = document.getElementById('victory-floors-display');
    const victoryTimeDisplay = document.getElementById('victory-time-display');
    const victoryPaceDisplay = document.getElementById('victory-pace-display');
    const victoryResultDisplay = document.getElementById('victory-result-display');
    const victoryStreakDisplay = document.getElementById('victory-streak-display');
    const footerText = document.getElementById('footer-text');

    const floorNumberVal = document.getElementById('floor-number-val');
    const floorRuleText = document.getElementById('floor-rule-text');
    const questionText = document.getElementById('question-text');
    const optionsGrid = document.getElementById('options-grid');
    const messageBox = document.getElementById('message-box');
    const timerBarFill = document.getElementById('timer-bar-fill');

    const statsModal = document.getElementById('modal-vault');
    const statsBtn = document.getElementById('btn-landing-stats');
    const victoryStatsBtn = document.getElementById('btn-victory-stats');
    const closeVaultBtn = document.getElementById('btn-close-vault');
    const soundBtn = document.getElementById('btn-sound');
    const vaultList = document.getElementById('vault-list');

    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];

    init();

    function init() {
        activeDataSet = window.TYKB_DAILY_SET || null;
        activeGameData = activeDataSet ? activeDataSet.floors : [];
        bindEvents();
        updateStatsDisplay();
    }

    function bindEvents() {
        startClimbBtn.addEventListener('click', startGame);

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                statsModal.classList.remove('hidden');
                populateVault();
            });
        }

        if (victoryStatsBtn) {
            victoryStatsBtn.addEventListener('click', () => {
                statsModal.classList.remove('hidden');
                populateVault();
            });
        }

        closeVaultBtn.addEventListener('click', () => {
            statsModal.classList.add('hidden');
            if (victoryScreen && victoryScreen.style.display !== 'none') {
                resetToStartScreen();
            }
        });

        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
        });
    }

    function startMatchTimer() {
        stopMatchTimer();
        totalElapsedSeconds = 0;
        gameStartTime = Date.now();
        if (activeGameTimer) {
            activeGameTimer.style.display = 'block';
            activeGameTimer.textContent = '00:00';
        }
        activeGameTimerInterval = setInterval(updateMatchTimerDisplay, 1000);
    }

    function stopMatchTimer() {
        if (activeGameTimerInterval) clearInterval(activeGameTimerInterval);
    }

    function updateMatchTimerDisplay() {
        totalElapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        if (activeGameTimer) {
            activeGameTimer.textContent = formatTime(totalElapsedSeconds);
        }
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    async function fetchFileWithFallbacks(filename) {
        const candidatePaths = [
            `./archives/${filename}`,
            `./${filename}`,
            `./assets/data/floors/${filename}`,
            `./data/${filename}`,
            filename
        ];

        for (const path of candidatePaths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    const data = await res.json();
                    if (data) return data;
                }
            } catch (e) {}
        }
        return null;
    }

    async function populateVault() {
        if (!vaultList) return;
        vaultList.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">Loading Archives...</div>';
        
        const fetchPromises = [];
        for (let i = 1; i <= 50; i++) {
            const paddedId = String(i).padStart(2, '0');
            fetchPromises.push(fetchFileWithFallbacks(`sandbox-ball.${paddedId}.json`).then(data => ({ id: paddedId, data })));
        }

        const results = await Promise.all(fetchPromises);
        const buttons = [];

        results.forEach(({ id, data }) => {
            if (data && data.floors) {
                const btn = document.createElement('button');
                btn.className = 'vault-item-btn';
                btn.innerHTML = `<strong>Archive ${id}</strong>`;
                btn.onclick = () => loadVaultSet(data);
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

    function loadVaultSet(data) {
        if (data && data.floors) {
            activeDataSet = data;
            activeGameData = data.floors;
            statsModal.classList.add('hidden');
            startGame();
        }
    }

    function startGame() {
        if (!activeGameData || activeGameData.length === 0) {
            activeDataSet = window.TYKB_DAILY_SET || null;
            activeGameData = activeDataSet ? activeDataSet.floors : [];
        }

        startScreen.style.display = 'none';
        if (victoryScreen) victoryScreen.style.display = 'none';
        gameplayHeader.style.display = 'flex';
        hudContainer.style.display = 'flex';
        gameWorkspace.style.display = 'flex';
        if (footerText) footerText.style.display = 'block';

        currentFloorIndex = 0;
        startMatchTimer();
        loadFloor(currentFloorIndex);
    }

    function resetToStartScreen() {
        if (victoryScreen) victoryScreen.style.display = 'none';
        if (hudContainer) hudContainer.style.display = 'none';
        if (gameWorkspace) gameWorkspace.style.display = 'none';
        if (gameplayHeader) gameplayHeader.style.display = 'none';
        if (activeGameTimer) activeGameTimer.style.display = 'none';
        if (startScreen) startScreen.style.display = 'flex';
    }

    function getOrdinalFloorHTML(floorNum) {
        const ord = ordinals[floorNum - 1] || `${floorNum}th`;
        return `<span style="color: var(--genre-yellow);">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
    }

    function loadFloor(index) {
        if (!activeGameData || index >= activeGameData.length) return;

        clearInterval(timerInterval);
        const floorData = activeGameData[index];
        isProcessing = false;
        showMessage('');

        floorNumberVal.innerHTML = getOrdinalFloorHTML(index + 1);
        floorRuleText.textContent = `1 QUESTION • SELECT THE CORRECT ANSWER`;

        updateTowerStack(index + 1);
        displayQuestion(floorData);
        startTimer(floorData.timeLimit || 15);
    }

    function displayQuestion(floorData) {
        questionText.textContent = floorData.question;
        optionsGrid.innerHTML = '';

        floorData.options.forEach((optionStr) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = optionStr;
            btn.addEventListener('click', () => handleOptionSelect(btn, optionStr, floorData.answer));
            optionsGrid.appendChild(btn);
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
                handleFloorFailure('TIME EXPIRED');
            }
        }, 100);
    }

    function updateTimerBar() {
        const pct = Math.max(0, (timeRemaining / totalFloorTime) * 100);
        timerBarFill.style.width = `${pct}%`;

        if (pct <= 20) {
            timerBarFill.style.backgroundColor = 'var(--state-error)';
            timerBarFill.style.boxShadow = '0 0 10px var(--state-error-glow)';
        } else if (pct <= 50) {
            timerBarFill.style.backgroundColor = 'var(--state-warning)';
            timerBarFill.style.boxShadow = '0 0 8px var(--state-warning-glow)';
        } else {
            timerBarFill.style.backgroundColor = 'var(--state-active)';
            timerBarFill.style.boxShadow = '0 0 8px var(--state-active-glow)';
        }
    }

    function handleOptionSelect(selectedBtn, selectedStr, correctStr) {
        if (isProcessing) return;
        isProcessing = true;
        clearInterval(timerInterval);

        if (selectedStr === correctStr) {
            selectedBtn.classList.add('correct');
            showMessage('CORRECT!', true);

            setTimeout(() => {
                if (currentFloorIndex + 1 >= activeGameData.length) {
                    stopMatchTimer();
                    const newStats = recordGameResult(true, 11);
                    renderReceipt(true, 10, newStats, '10/10 Perfect Clear');
                } else {
                    currentFloorIndex++;
                    loadFloor(currentFloorIndex);
                }
            }, 700);
        } else {
            selectedBtn.classList.add('wrong');
            
            const allBtns = optionsGrid.querySelectorAll('.option-btn');
            allBtns.forEach(btn => {
                if (btn.textContent === correctStr) {
                    btn.classList.add('correct');
                }
            });

            const failedFloorNum = currentFloorIndex + 1;
            setTimeout(() => {
                handleFloorFailure(`INCORRECT ON FLOOR ${failedFloorNum}`);
            }, 800);
        }
    }

    function handleFloorFailure(reason) {
        showMessage(`${reason} — DROPPED TO 1ST FLOOR`, false);

        const towerFloors = document.querySelectorAll('.tower-floor');
        const activeTowerFloor = Array.from(towerFloors).find(
            f => parseInt(f.dataset.floor) === currentFloorIndex + 1
        );
        if (activeTowerFloor) activeTowerFloor.classList.add('failed');

        stopMatchTimer();
        const peakFloor = currentFloorIndex + 1;
        const newStats = recordGameResult(false, peakFloor);

        // If player achieved a high peak (Floor 7+), show receipt screen; otherwise reset to Floor 1
        setTimeout(() => {
            if (peakFloor >= 7) {
                renderReceipt(false, peakFloor - 1, newStats, `${reason}`);
            } else {
                currentFloorIndex = 0;
                startMatchTimer();
                loadFloor(0);
            }
        }, 1400);
    }

    function renderReceipt(isPerfect, clearedFloors, stats, resultMsg) {
        if (isPerfect) {
            receiptTagHeader.textContent = "DESTINATION REACHED";
            receiptMainTitle.textContent = "PERFECT";
            victoryFloorsDisplay.textContent = "Floor 10 / 10";
            victoryFloorsDisplay.style.color = "var(--state-success)";
        } else {
            receiptTagHeader.textContent = "PEAK ELEVATION REACHED";
            receiptMainTitle.textContent = `FLOOR ${String(clearedFloors + 1).padStart(2, '0')}`;
            victoryFloorsDisplay.textContent = `Floor ${clearedFloors} / 10`;
            victoryFloorsDisplay.style.color = "var(--genre-yellow)";
        }

        const floorsCount = Math.max(1, clearedFloors);
        const avgPace = (totalElapsedSeconds / floorsCount).toFixed(1);

        if (victoryTimeDisplay) victoryTimeDisplay.textContent = formatTime(totalElapsedSeconds);
        if (victoryPaceDisplay) victoryPaceDisplay.textContent = `${avgPace}s / floor`;
        if (victoryResultDisplay) victoryResultDisplay.textContent = resultMsg;
        if (victoryStreakDisplay) victoryStreakDisplay.textContent = `${stats.streak} Days`;

        if (hudContainer) hudContainer.style.display = 'none';
        if (gameWorkspace) gameWorkspace.style.display = 'none';
        if (gameplayHeader) gameplayHeader.style.display = 'none';
        if (activeGameTimer) activeGameTimer.style.display = 'none';
        if (footerText) footerText.style.display = 'none';

        if (victoryScreen) victoryScreen.style.display = 'flex';
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
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = stats.wins;

        const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        document.getElementById('stat-winrate').textContent = `${winRate}%`;
        document.getElementById('stat-streak').textContent = `${stats.streak}`;

        const bestOrd = ordinals[stats.bestFloor - 1] || `${stats.bestFloor}th`;
        document.getElementById('stat-bestfloor').textContent = `${bestOrd} Floor`;
    }
});
