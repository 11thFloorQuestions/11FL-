/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - CORE GAME LOGIC (clusters.js)
 * ============================================================================
 * Mechanics: 10 Playable Floors leading to 11th Floor Destination, 
 * Complete Sorts (All tiles sorted), 3 Strikes Lives System.
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
    let currentFloorConfig = null;
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
    const pips = [document.getElementById('pip-1'), document.getElementById('pip-2'), document.getElementById('pip-3')];

    function init() {
        if (!window.CLUSTERS_DATA) {
            statusMessage.textContent = "ERROR: CLUSTERS DATA NOT LOADED.";
            return;
        }

        const availableDates = Object.keys(window.CLUSTERS_DATA).sort();
        const todayStr = new Date().toISOString().split('T')[0];
        const activeDateKey = window.CLUSTERS_DATA[todayStr] ? todayStr : availableDates[availableDates.length - 1];

        puzzleData = window.CLUSTERS_DATA[activeDateKey];

        btnShuffle.addEventListener('click', shuffleActiveTiles);
        btnSubmit.addEventListener('click', handleSubmission);
        
        btnSound.addEventListener('click', () => {
            btnSound.textContent = btnSound.textContent.includes('OFF') ? 'SOUND: ON' : 'SOUND: OFF';
        });

        renderTowerStack(0);
        renderIntroScreen();
    }

    function renderTowerStack(activeFloor) {
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
            if (index < currentLives) {
                pip.classList.remove('lost');
            } else {
                pip.classList.add('lost');
            }
        });
    }

    function renderIntroScreen() {
        gameState = 'intro';
        actionPanelContainer.style.display = 'none';
        floorHudContainer.style.display = 'none';
        solvedGroupsContainer.innerHTML = '';
        puzzlePrompt.textContent = "";
        renderTowerStack(0);

        tileGrid.className = 'tile-grid grid-ascent';
        tileGrid.innerHTML = `
            <div style="grid-column: span 2;" class="landing-container">
                <div class="landing-challenge-text">
                    Can you reach the 11th floor? Fail and you're back to the ground floor.
                </div>
                <button class="btn-start" id="btn-start-climb">Start Climb</button>
            </div>
        `;

        document.getElementById('btn-start-climb').addEventListener('click', startClimb);
    }

    function startClimb() {
        gameState = 'playing';
        currentLives = 3;
        updateLivesDisplay();
        floorHudContainer.style.display = 'flex';
        actionPanelContainer.style.display = 'flex';
        currentFloor = 1;
        loadFloor(currentFloor);
    }

    function loadFloor(floorNum) {
        currentFloor = floorNum;
        floorNumVal.textContent = String(currentFloor).padStart(2, '0');
        renderTowerStack(currentFloor);
        selectedTiles = [];
        solvedGroupsContainer.innerHTML = '';
        statusMessage.textContent = '';
        btnSubmit.disabled = true;

        currentFloorConfig = puzzleData.floors[currentFloor];
        if (!currentFloorConfig) {
            renderVictory();
            return;
        }

        activeTiles = [...currentFloorConfig.tiles];
        remainingGroups = currentFloorConfig.groups.map(g => ({ ...g }));

        if (currentFloor <= 3) {
            floorPhaseTag.textContent = "ASCENT";
            puzzlePrompt.textContent = "Sort all tiles into 2 groups of 3.";
        } else if (currentFloor >= 4 && currentFloor <= 6) {
            floorPhaseTag.textContent = "SQUEEZE";
            puzzlePrompt.textContent = "Sort all tiles into 3 groups of 3.";
        } else if (currentFloor >= 7 && currentFloor <= 9) {
            floorPhaseTag.textContent = "DEEP WALL";
            puzzlePrompt.textContent = "Sort all tiles into 4 groups of 3.";
        } else if (currentFloor === 10) {
            floorPhaseTag.textContent = "FINAL WALL";
            puzzlePrompt.textContent = "Sort all 16 tiles into 4 groups of 4.";
        }

        shuffleArray(activeTiles);
        renderGrid();
    }

    function renderGrid() {
        tileGrid.innerHTML = '';

        if (currentFloor <= 3) {
            tileGrid.className = 'tile-grid grid-ascent';
        } else if (currentFloor >= 4 && currentFloor <= 6) {
            tileGrid.className = 'tile-grid grid-squeeze';
        } else if (currentFloor >= 7 && currentFloor <= 9) {
            tileGrid.className = 'tile-grid grid-wall-12';
        } else {
            tileGrid.className = 'tile-grid grid-wall-16';
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

        btnSubmit.disabled = (selectedTiles.length !== maxSelection);
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
            btnSubmit.disabled = true;

            const tileElements = tileGrid.querySelectorAll('.cluster-tile');
            tileElements.forEach(el => {
                if (selectedTiles.includes(el.textContent)) {
                    el.classList.remove('selected');
                    el.classList.add('success');
                }
            });

            statusMessage.textContent = "CORRECT CLUSTER.";

            setTimeout(() => {
                const solvedGroup = remainingGroups.splice(matchedGroupIndex, 1)[0];
                activeTiles = activeTiles.filter(t => !solvedGroup.words.includes(t));

                appendSolvedCard(solvedGroup);
                selectedTiles = [];
                gameState = 'playing';
                renderGrid();

                if (remainingGroups.length === 0) {
                    setTimeout(() => {
                        if (currentFloor < 10) {
                            statusMessage.textContent = `FLOOR ${String(currentFloor).padStart(2, '0')} CLEARED. ADVANCING...`;
                            setTimeout(() => loadFloor(currentFloor + 1), 900);
                        } else {
                            renderVictory();
                        }
                    }, 400);
                }
            }, 600);

        } else {
            // Wrong guess -> lose a life pip
            currentLives--;
            updateLivesDisplay();

            if (currentLives > 0) {
                statusMessage.textContent = `INCORRECT. ${currentLives} LIVES REMAINING.`;
                selectedTiles = [];
                btnSubmit.disabled = true;
                renderGrid();
            } else {
                triggerBrutalReset();
            }
        }
    }

    function appendSolvedCard(group) {
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
        btnSubmit.disabled = true;
        
        penaltyOverlay.classList.add('flash');
        statusMessage.textContent = "OUT OF LIVES. DROPPED TO FLOOR 01.";

        setTimeout(() => {
            penaltyOverlay.classList.remove('flash');
            currentLives = 3;
            updateLivesDisplay();
            loadFloor(1);
        }, 1200);
    }

    function renderVictory() {
        gameState = 'victory';
        floorHudContainer.style.display = 'none';
        actionPanelContainer.style.display = 'none';
        solvedGroupsContainer.innerHTML = '';
        puzzlePrompt.textContent = "";
        renderTowerStack(10);

        tileGrid.className = 'tile-grid grid-ascent';
        tileGrid.innerHTML = `
            <div style="grid-column: span 2;" class="landing-container">
                <div style="font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--accent-green); letter-spacing: 1.5px;">
                    11TH FLOOR REACHED
                </div>
                <div class="landing-challenge-text">
                    Congratulations! You have reached the 11th Floor. Come back tomorrow to continue your streak.
                </div>
                <a href="index.html" class="btn-start" style="text-decoration: none; display: inline-block; text-align: center;">RETURN TO LOBBY</a>
            </div>
        `;
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
