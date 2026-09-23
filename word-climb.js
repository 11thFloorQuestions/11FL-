// Fallback floor data so Game 1 always renders even if JSON fetch fails
const DEFAULT_FLOOR_1 = {
  floor: 1,
  letters: "CLEARINGS",
  targetWordLength: 5,
  validWords: ["CLEAR", "CLEAN", "GRAIN", "LEARN", "SIGNAL", "RAILS", "ANGEL"]
};

let currentFloorData = null;

async function loadAndPlayFloor(floorNum) {
    if (floorNum === 11) {
        if (typeof triggerDestinationView === 'function') {
            triggerDestinationView();
        }
        return;
    }

    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentFloorData = await response.json();
        if (typeof setupGameSession === 'function') {
            setupGameSession(currentFloorData);
        }
    } catch (error) {
        console.warn("Floor JSON not found, loading default floor setup:", error);
        currentFloorData = DEFAULT_FLOOR_1;
        if (typeof setupGameSession === 'function') {
            setupGameSession(DEFAULT_FLOOR_1);
        }
    }
}

function setupScreenNavigation() {
    const wordClimbBtn = document.getElementById("goto-wordclimb-btn");
    const exitBtn = document.getElementById("exit-btn");
    
    const landingScreen = document.getElementById("landing-screen");
    const gameScreen = document.getElementById("game-screen");

    if (wordClimbBtn) {
        wordClimbBtn.addEventListener("click", () => {
            if (landingScreen) landingScreen.style.display = "none";
            if (gameScreen) gameScreen.style.display = "flex";
            loadAndPlayFloor(1);
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            if (gameScreen) gameScreen.style.display = "none";
            if (landingScreen) landingScreen.style.display = "flex";
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    setupScreenNavigation();
});
