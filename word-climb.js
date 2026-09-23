// Fallback floor data so Game 1 always renders even if JSON fetch fails
const DEFAULT_FLOOR_1 = {
  floor: 1,
  letters: "CLEARINGS",
  targetWordLength: 5,
  validWords: ["CLEAR", "CLEAN", "GRAIN", "LEARN", "SIGNAL", "RAILS", "ANGEL"]
};

async function loadAndPlayFloor(floorNum) {
    if (floorNum === 11) {
        triggerDestinationView();
        return;
    }

    const formattedNum = String(floorNum).padStart(2, '0');
    const filePath = `assets/data/floors/floor_${formattedNum}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        currentFloorData = await response.json();
        setupGameSession(currentFloorData);
    } catch (error) {
        console.warn("Floor JSON not found, loading default floor setup:", error);
        // Fallback execution ensures the game board and wheel render reliably
        currentFloorData = DEFAULT_FLOOR_1;
        setupGameSession(DEFAULT_FLOOR_1);
    }
}

function setupScreenNavigation() {
    const wordClimbBtn = document.getElementById("goto-wordclimb-btn");
    const questionsBtn = document.getElementById("goto-questions-btn");
    const exitBtn = document.getElementById("exit-btn");
    const exitQuestionsBtn = document.getElementById("exit-questions-btn");
    
    const landingScreen = document.getElementById("landing-screen");
    const gameScreen = document.getElementById("game-screen");
    const questionsScreen = document.getElementById("questions-screen");

    if (wordClimbBtn) {
        wordClimbBtn.addEventListener("click", () => {
            landingScreen.style.display = "none";
            gameScreen.style.display = "flex";
            loadAndPlayFloor(1);
        });
    }

    if (questionsBtn) {
        questionsBtn.addEventListener("click", () => {
            landingScreen.style.display = "none";
            if (questionsScreen) questionsScreen.style.display = "flex";
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            gameScreen.style.display = "none";
            landingScreen.style.display = "flex";
        });
    }

    if (exitQuestionsBtn) {
        exitQuestionsBtn.addEventListener("click", () => {
            if (questionsScreen) questionsScreen.style.display = "none";
            landingScreen.style.display = "flex";
        });
    }
}
