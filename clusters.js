/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - CORE GAME LOGIC (clusters.js)
 * ============================================================================
 * Logic: Distractor pools, lock correct groups above grid, reduce pool size,
 * 3-strike lives system, 10 playable floors leading to 11th floor destination.
 * ============================================================================
 */

(function () {
    'use strict';

    let puzzleData = null;
    let currentFloor = 1;
    let gameState = 'intro';
    let selectedTiles = [];
    let activeTiles = [];
    let remainingGroups = [];
    let currentLives = 3;

    const floorNumVal = document.getElementById('floor-number-val');
    const floorPhaseTag = document.getElementById('floor-phase-tag');
    const puzzlePrompt = document.getElementById('puzzle-prompt');
    const solvedGroupsContainer = document.getElementById('solved-groups-container');
    const tileGrid = document.getElementById('tile-grid');
    const btnShuffle = document.getElementById('btn-shuffle');
    const btnSubmit = document.getElementById('btn-submit');
    const statusMessage = document.getElementById('status-message');
    const penaltyOverlay = document.getElementById('penalty-overlay');
    const actionPanelContainer = document.getElementById('action-panel-container');
    const towerStack = document.getElementById('tower-stack');
    const btnSound = document.getElementById('btn-sound');
    const floorHudContainer = document.getElementById('floor-hud-container');
    const startScreen = document.getElementById('start-screen');
    const mainContent = document.getElementById('game-main-content');
    const btnStartClimb = document.getElementById('btn-start-climb');
    const pips = [document.getElementById('pip-1'), document.getElementById('pip-2'), document.getElementById('pip-3')];

    function getOrdinalFloorHTML(floorNum) {
        const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
        const ord = ordinals[floorNum - 1] || `${floorNum}th`;
        return `<span style="color: var(--genre-orange); font-size: 1.25rem; font-weight: 700;">${ord}</span> <span style="color: #ffffff;">Floor</span>`;
    }

    function init() {
        if (!window.CLUSTERS_DATA) {
            if (statusMessage) statusMessage.textContent = "ERROR: CLUSTERS DATA NOT LOADED.";
            return;
        }

        const availableDates = Object.keys(window.CLUSTERS_DATA).sort();
        const todayStr = new Date().toISOString().split('T')[0];
        const activeDateKey = window.CLUSTERS_DATA[todayStr] ? todayStr : availableDates[availableDates.length - 1];

        puzzleData = window.CLUSTERS_DATA[activeDateKey];

        if (btnShuffle) btnShuffle.addEventListener('click', shuffleActiveTiles);
        if (btnSubmit) btnSubmit.addEventListener('click', handleSubmission);
        
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                btnSound.textContent = btnSound.textContent.includes('OFF') ? 'SOUND: ON' : 'SOUND: OFF';
            });
        }

        if (btnStartClimb) {
            btnStartClimb.addEventListener('click', startClimb);
        }

        renderTowerStack(0);
    }

    function renderTowerStack(activeFloor) {
        if (!towerStack) return;
        towerStack.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const floorBar = document.createElement('div');
            floorBar.className = 'tower-floor';
            if (i <= activeFloor) {
                floorBar.classList.add('active');
            }
            towerStack.appendChild(floorBar);
        }
    }

    function updateLivesDisplay() {
        pips.forEach((pip, index) => {
            if (!pip) return;
            if (index < currentLives) {
                pip.classList.remove('lost');
            } else {
                pip.classList.add('lost');
            }
        });
    }

    function startClimb() {
        gameState = 'playing';
        currentLives = 3;
        updateLivesDisplay();

        if (startScreen) startScreen.style.display = 'none';
        if (floorHudContainer) floorHudContainer.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'flex';
        if (actionPanelContainer) actionPanelContainer.style.display = 'flex';

        currentFloor = 1;
        loadFloor(currentFloor);
    }

    function loadFloor(floorNum) {
        currentFloor = floorNum;
        if (floorNumVal) {
            floorNumVal.innerHTML = getOrdinalFloorHTML(currentFloor);
        }
        renderTowerStack(currentFloor);
        selectedTiles = [];
        if (solvedGroupsContainer) solvedGroupsContainer.innerHTML = '';
        if (statusMessage) statusMessage.textContent = '';
        if (btnSubmit) btnSubmit.disabled = true;

        const floorConfig = puzzleData.floors[currentFloor];
        if (!floorConfig) {
            renderVictory();
            return;
        }

        activeTiles = [...floorConfig.tiles];
        remainingGroups = floorConfig.groups.map(g => ({ ...g }));

        if (puzzlePrompt) {
            if (currentFloor <= 4) {
                if (floorPhaseTag) floorPhaseTag.textContent = "ASCENT";
                puzzlePrompt.textContent = "Find 2 groups of 3 from the 12 tiles.";
            } else if (currentFloor >= 5 && currentFloor <= 9) {
                if (floorPhaseTag) floorPhaseTag.textContent = "SQUEEZE";
                puzzlePrompt.textContent = "Find 3 groups of 3 from the 12 tiles.";
            } else if (currentFloor === 10) {
                if (floorPhaseTag) floorPhaseTag.textContent = "FINAL WALL";
                puzzlePrompt.textContent = "Sort all 16 tiles into 4 groups of 4.";
            }
        }

        shuffleArray(activeTiles);
        renderGrid();
    }

    function renderGrid() {
        if (!tileGrid) return;
        tileGrid.innerHTML = '';

        if (currentFloor === 10) {
            tileGrid.className = 'tile-grid grid-col-4';
        } else {
            tileGrid.className = 'tile-grid grid-col-3';
        }

        activeTiles.forEach(tileText => {
            const tileEl = document.createElement('div');
            tileEl.className = 'cluster-tile';
            if (selectedTiles.includes(tileText)) {
                tileEl.classList.add('selected');
            }
            tileEl.textContent = tileText;
            tileEl.addEventListener('click', () => handleTileClick(tileText, tileEl));
            tileGrid.appendChild(tileEl);
        });
    }

    function handleTileClick(tileText, tileEl) {
        if (gameState !== 'playing') return;

        const maxSelection = (currentFloor === 10) ? 4 : 3;

        const index = selectedTiles.indexOf(tileText);
        if (index > -1) {
            selectedTiles.splice(index, 1);
            tileEl.classList.remove('selected');
        } else {
            if (selectedTiles.length < maxSelection) {
                selectedTiles.push(tileText);
                tileEl.classList.add('selected');
            }
        }

        if (btnSubmit) btnSubmit.disabled = (selectedTiles.length !== maxSelection);
    }

    function shuffleActiveTiles() {
        if (gameState !== 'playing') return;
        shuffleArray(activeTiles);
        renderGrid();
    }

    function handleSubmission() {
        if (gameState !== 'playing') return;

        const maxSelection = (currentFloor === 10) ? 4 : 3;
        if (selectedTiles.length !== maxSelection) return;

        let matchedGroupIndex = -1;
        for (let i = 0; i < remainingGroups.length; i++) {
            const groupWords = remainingGroups[i].words;
            const isMatch = selectedTiles.every(t => groupWords.includes(t)) && groupWords.every(t => selectedTiles.includes(t));
            if (isMatch) {
                matchedGroupIndex = i;
                break;
            }
        }

        if (matchedGroupIndex > -1) {
            gameState = 'animating';
            if (btnSubmit) btnSubmit.disabled = true;

            const tileElements = tileGrid.querySelectorAll('.cluster-tile');
            tileElements.forEach(el => {
                if (selectedTiles.includes(el.textContent)) {
                    el.classList.remove('selected');
                    el.classList.add('success');
                }
            });

            if (statusMessage) statusMessage.textContent = "CORRECT CLUSTER.";

            setTimeout(() => {
                const solvedGroup = remainingGroups.splice(matchedGroupIndex, 1)[0];
                solvedGroup.words.forEach(word => {
                    const idx = activeTiles.indexOf(word);
                    if (idx > -1) activeTiles.splice(idx, 1);
                });

                appendSolvedCard(solvedGroup);
                selectedTiles = [];
                gameState = 'playing';
                renderGrid();

                if (remainingGroups.length === 0) {
                    setTimeout(() => {
                        if (currentFloor < 10) {
                            const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th"];
                            if (statusMessage) statusMessage.textContent = `${ordinals[currentFloor - 1].toUpperCase()} FLOOR CLEARED. ADVANCING...`;
                            setTimeout(() => loadFloor(currentFloor + 1), 900);
                        } else {
                            renderVictory();
                        }
                    }, 400);
                }
            }, 600);

        } else {
            currentLives--;
            updateLivesDisplay();

            if (currentLives > 0) {
                if (statusMessage) statusMessage.textContent = `INCORRECT. ${currentLives} LIVES REMAINING.`;
                selectedTiles = [];
                if (btnSubmit) btnSubmit.disabled = true;
                renderGrid();
            } else {
                triggerBrutalReset();
            }
        }
    }

    function appendSolvedCard(group) {
        if (!solvedGroupsContainer) return;
        const card = document.createElement('div');
        card.className = 'solved-group-card';
        card.innerHTML = `
            <div class="solved-group-category">${group.category}</div>
            <div class="solved-group-words">${group.words.join(' // ')}</div>
        `;
        solvedGroupsContainer.appendChild(card);
    }

    function triggerBrutalReset() {
        gameState = 'penalty';
        if (btnSubmit) btnSubmit.disabled = true;
        
        if (penaltyOverlay) penaltyOverlay.classList.add('flash');
        if (statusMessage) statusMessage.textContent = "OUT OF LIVES. DROPPED TO 1ST FLOOR.";

        setTimeout(() => {
            if (penaltyOverlay) penaltyOverlay.classList.remove('flash');
            currentLives = 3;
            updateLivesDisplay();
            loadFloor(1);
        }, 1200);
    }

    function renderVictory() {
        gameState = 'victory';
        if (floorHudContainer) floorHudContainer.style.display = 'none';
        if (actionPanelContainer) actionPanelContainer.style.display = 'none';
        if (solvedGroupsContainer) solvedGroupsContainer.innerHTML = '';
        if (puzzlePrompt) puzzlePrompt.textContent = "";
        renderTowerStack(10);

        if (tileGrid) {
            tileGrid.className = 'tile-grid grid-col-3';
            tileGrid.innerHTML = `
                <div style="grid-column: span 3;" class="landing-container">
                    <div style="font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--state-success); letter-spacing: 1.5px;">
                        11TH FLOOR REACHED
                    </div>
                    <div class="landing-challenge-text">
                        Congratulations! You have reached the 11th Floor. Come back tomorrow to continue your streak.
                    </div>
                    <a href="index.html" class="btn-start" style="text-decoration: none; display: inline-block; text-align: center;">RETURN TO LOBBY</a>
                </div>
            `;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    window.addEventListener('DOMContentLoaded', init);

})();
