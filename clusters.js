/**
 * ============================================================================
 * 11TH FLOOR CLUSTERS - CORE GAME LOGIC (clusters.js)
 * ============================================================================
 * Ecosystem Mechanics: 11-Floor Climb, Strict Single-Mistake Reset, 
 * Dynamic Grid Layouts, Date-Indexed Daily Puzzles.
 * ============================================================================
 */

(function () {
    'use strict';

    // --- State Management ---
    let puzzleData = null;
    let currentFloor = 1;
    let gameState = 'intro'; // 'intro', 'playing', 'victory'
    let selectedTiles = [];
    let activeTiles = [];
    let remainingGroups = [];
    let currentFloorConfig = null;

    // --- DOM Elements ---
    const floorNumVal = document.getElementById('floor-number-val');
    const floorPhaseTag = document.getElementById('floor-phase-tag');
    const puzzlePrompt = document.getElementById('puzzle-prompt');
    const solvedGroupsContainer = document.getElementById('solved-groups-container');
    const tileGrid = document.getElementById('tile-grid');
    const btnShuffle = document.getElementById('btn-shuffle');
    const btnSubmit = document.getElementById('btn-submit');
    const statusMessage = document.getElementById('status-message');
    const penaltyOverlay = document.getElementById('penalty-overlay');
    const floorHud = document.querySelector('.floor-hud');

    // --- Initialization ---
    function init() {
        if (!window.CLUSTERS_DATA) {
            statusMessage.textContent = "ERROR: CLUSTERS DATA NOT LOADED.";
            return;
        }

        // Resolve today's puzzle date or fallback to the latest available puzzle
        const availableDates = Object.keys(window.CLUSTERS_DATA).sort();
        const todayStr = new Date().toISOString().split('T')[0];
        const activeDateKey = window.CLUSTERS_DATA[todayStr] ? todayStr : availableDates[availableDates.length - 1];

        puzzleData = window.CLUSTERS_DATA[activeDateKey];

        // Bind Control Listeners
        btnShuffle.addEventListener('click', shuffleActiveTiles);
        btnSubmit.addEventListener('click', handleSubmission);

        renderIntroScreen();
    }

    // --- Intro Screen Render ---
    function renderIntroScreen() {
        gameState = 'intro';
        floorHud.style.display = 'none';
        btnShuffle.style.display = 'none';
        btnSubmit.style.display = 'none';
        solvedGroupsContainer.innerHTML = '';
        puzzlePrompt.textContent = "";

        tileGrid.className = 'tile-grid grid-warmup';
        tileGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px 15px; display: flex; flex-direction: column; gap: 15px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: var(--text-primary); letter-spacing: 1px;">
                    ${puzzleData.title}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
                    Climb 11 floors of interconnected linguistic and global clusters.<br>
                    <strong style="color: var(--accent-red);">Warning:</strong> One single incorrect submission drops you instantly back to Floor 01.
                </div>
                <button class="btn btn-primary" id="btn-start-climb" style="margin-top: 10px;">START CLIMB</button>
            </div>
        `;

        document.getElementById('btn-start-climb').addEventListener('click', startClimb);
    }

    // --- Start Climb ---
    function startClimb() {
        gameState = 'playing';
        floorHud.style.display = 'flex';
        btnShuffle.style.display = 'block';
        btnSubmit.style.display = 'block';
        currentFloor = 1;
        loadFloor(currentFloor);
    }

    // --- Load Floor Data ---
    function loadFloor(floorNum) {
        currentFloor = floorNum;
        floorNumVal.textContent = String(currentFloor).padStart(2, '0');
        selectedTiles = [];
        solvedGroupsContainer.innerHTML = '';
        statusMessage.textContent = '';
        btnSubmit.disabled = true;

        currentFloorConfig = puzzleData.floors[currentFloor];
        if (!currentFloorConfig) {
            triggerVictory();
            return;
        }

        // Configure Phase and Tiles based on Floor number
        if (currentFloor <= 4) {
            floorPhaseTag.textContent = "WARMUP PHASE";
            puzzlePrompt.textContent = "Isolate the target group of 3 from the decoy group.";
            activeTiles = [...currentFloorConfig.tiles];
            remainingGroups = [{ words: currentFloorConfig.targetGroup, category: currentFloorConfig.targetCategory }];
        } else if (currentFloor >= 5 && currentFloor <= 8) {
            floorPhaseTag.textContent = "SQUEEZE PHASE";
            puzzlePrompt.textContent = "Sort all 9 tiles into 3 distinct groups of 3.";
            activeTiles = [...currentFloorConfig.tiles];
            remainingGroups = currentFloorConfig.groups.map(g => ({ ...g }));
        } else if (currentFloor >= 9 && currentFloor <= 11) {
            floorPhaseTag.textContent = "THE WALL";
            puzzlePrompt.textContent = "Unravel all 4 groups of 4 from the 16-tile wall.";
            activeTiles = [...currentFloorConfig.tiles];
            remainingGroups = currentFloorConfig.groups.map(g => ({ ...g }));
        }

        shuffleArray(activeTiles);
        renderGrid();
    }

    // --- Render Active Grid ---
    function renderGrid() {
        tileGrid.innerHTML = '';

        if (currentFloor <= 4) {
            tileGrid.className = 'tile-grid grid-warmup';
        } else if (currentFloor >= 5 && currentFloor <= 8) {
            tileGrid.className = 'tile-grid grid-squeeze';
        } else {
            tileGrid.className = 'tile-grid grid-wall';
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

    // --- Tile Click Interaction ---
    function handleTileClick(tileText, tileEl) {
        if (gameState !== 'playing') return;

        const maxSelection = (currentFloor >= 9) ? 4 : 3;

        const index = selectedTiles.indexOf(tileText);
        if (index > -1) {
            // Deselect
            selectedTiles.splice(index, 1);
            tileEl.classList.remove('selected');
        } else {
            // Select if under limit
            if (selectedTiles.length < maxSelection) {
                selectedTiles.push(tileText);
                tileEl.classList.add('selected');
            }
        }

        btnSubmit.disabled = (selectedTiles.length !== maxSelection);
    }

    // --- Shuffle Active Tiles ---
    function shuffleActiveTiles() {
        if (gameState !== 'playing') return;
        shuffleArray(activeTiles);
        renderGrid();
    }

    // --- Submission & Validation Logic ---
    function handleSubmission() {
        if (gameState !== 'playing') return;

        const maxSelection = (currentFloor >= 9) ? 4 : 3;
        if (selectedTiles.length !== maxSelection) return;

        // Check against remaining groups for this floor
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
            // Correct Group Found!
            const solvedGroup = remainingGroups.splice(matchedGroupIndex, 1)[0];
            
            // Remove solved tiles from active tiles array
            activeTiles = activeTiles.filter(t => !solvedGroup.words.includes(t));

            // Render Solved Card
            appendSolvedCard(solvedGroup);

            // Reset selection for next group / floor
            selectedTiles = [];
            btnSubmit.disabled = true;
            renderGrid();

            // Check if floor is complete
            if (remainingGroups.length === 0) {
                setTimeout(() => {
                    if (currentFloor < 11) {
                        statusMessage.textContent = `FLOOR ${String(currentFloor).padStart(2, '0')} CLEARED. ADVANCING...`;
                        setTimeout(() => loadFloor(currentFloor + 1), 900);
                    } else {
                        renderVictory();
                    }
                }, 400);
            } else {
                statusMessage.textContent = "CORRECT CLUSTER.";
            }
        } else {
            // Incorrect Submission -> Brutal Penalty!
            triggerBrutalReset();
        }
    }

    // --- Solved Card UI Builder ---
    function appendSolvedCard(group) {
        const card = document.createElement('div');
        card.className = 'solved-group-card';
        card.innerHTML = `
            <div class="solved-group-category">${group.category}</div>
            <div class="solved-group-words">${group.words.join(' // ')}</div>
        `;
        solvedGroupsContainer.appendChild(card);
    }

    // --- Brutal Penalty Reset ---
    function triggerBrutalReset() {
        gameState = 'penalty';
        btnSubmit.disabled = true;
        
        // Flash red screen overlay
        penaltyOverlay.classList.add('flash');
        statusMessage.textContent = "MISTAKE DETECTED. DROPPED TO FLOOR 01.";

        setTimeout(() => {
            penaltyOverlay.classList.remove('flash');
            loadFloor(1);
        }, 1200);
    }

    // --- Victory State ---
    function renderVictory() {
        gameState = 'victory';
        floorHud.style.display = 'none';
        btnShuffle.style.display = 'none';
        btnSubmit.style.display = 'none';
        solvedGroupsContainer.innerHTML = '';
        puzzlePrompt.textContent = "";

        tileGrid.className = 'tile-grid grid-warmup';
        tileGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 40px 15px; display: flex; flex-direction: column; gap: 15px;">
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 800; color: var(--accent-red); letter-spacing: 2px;">
                    SUMMIT REACHED
                </div>
                <div style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.6;">
                    You successfully conquered all 11 floors of today's clusters puzzle without breaking your stride.
                </div>
                <a href="index.html" class="btn btn-primary" style="text-decoration: none; margin-top: 15px; display: inline-block;">RETURN TO ECOSYSTEM HUB</a>
            </div>
        `;
    }

    // --- Utility: Array Shuffler ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Run on DOM Load
    window.addEventListener('DOMContentLoaded', init);

})();
