/**
 * 11th Floor Questions - Original Gameplay Logic
 */

let questions = [];
let currentFloor = 1;
let currentQuestion = null;
let timerInterval = null;
let timeLeft = 15;
let floorHistory = []; // Array of booleans or scores per floor
let isSoundEnabled = true;

// Sound Synthesizer via Web Audio API
const playTone = (freq, type = 'sine', duration = 0.15) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio Context fallback handling
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestionDeck();
  setupEventListeners();
});

async function loadQuestionDeck() {
  try {
    const res = await fetch('questions.json');
    questions = await res.json();
  } catch (err) {
    console.error('Failed to load questions deck:', err);
    // Fallback question generator if json is unreachable
    questions = Array.from({ length: 11 }, (_, i) => ({
      floor: i + 1,
      category: 'GENERAL KNOWLEDGE',
      question: `Elevator Question for Floor ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A'
    }));
  }
}

function setupEventListeners() {
  const gotoQuestionsBtn = document.getElementById('goto-questions-btn');
  if (gotoQuestionsBtn) {
    gotoQuestionsBtn.addEventListener('click', () => {
      startClimb();
    });
  }

  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggle.innerText = isSoundEnabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
    });
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');
}

// Direct Game Start
function startClimb() {
  currentFloor = 1;
  floorHistory = [];
  showScreen('questions-screen');
  loadFloor(currentFloor);
}

function loadFloor(floorNum) {
  clearInterval(timerInterval);
  timeLeft = 15;

  const hudFloor = document.getElementById('hud-floor-label');
  if (hudFloor) {
    hudFloor.innerText = floorNum === 11 ? 'PENTHOUSE // 11TH FLOOR' : `FLOOR ${String(floorNum).padStart(2, '0')}`;
  }

  renderBuildingShaft(floorNum);
  
  // Find floor question
  const floorQuestions = questions.filter(q => q.floor === floorNum);
  currentQuestion = floorQuestions[Math.floor(Math.random() * floorQuestions.length)] || questions[0];

  renderQuestionCard(currentQuestion);
  startTimer();
}

function renderBuildingShaft(activeFloor) {
  const bldg = document.getElementById('floor-counter');
  if (!bldg) return;

  let html = '';
  for (let f = 11; f >= 1; f--) {
    const isActive = f === activeFloor ? 'active-floor' : '';
    const isPassed = f < activeFloor ? 'passed-floor' : '';
    const label = f === 11 ? 'PH' : String(f).padStart(2, '0');
    html += `<div class="shaft-floor ${isActive} ${isPassed}">${label}</div>`;
  }
  bldg.innerHTML = html;
}

function renderQuestionCard(q) {
  const gameView = document.getElementById('game-view');
  if (!gameView) return;

  // Shuffle options display order
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  gameView.innerHTML = `
    <div class="timer-container">
      <div id="timer-bar" class="timer-bar" style="width: 100%;"></div>
    </div>
    <div class="question-header">
      <span class="category-badge">${q.category || 'GENERAL TRIVIA'}</span>
    </div>
    <div class="question-text">${q.question}</div>
    <div class="options-grid">
      ${shuffledOptions.map(opt => `
        <button class="btn-option" onclick="handleAnswer('${escapeQuotes(opt)}', '${escapeQuotes(q.answer)}', this)">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

function startTimer() {
  const timerBar = document.getElementById('timer-bar');
  const startTime = Date.now();
  const duration = 15000;

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, duration - elapsed);
    const pct = (remaining / duration) * 100;

    if (timerBar) {
      timerBar.style.width = `${pct}%`;
      if (pct < 30) {
        timerBar.style.backgroundColor = '#ff4444';
      } else {
        timerBar.style.backgroundColor = '#00ffcc';
      }
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);
      playTone(180, 'sawtooth', 0.4);
      triggerFloorDrop('TIME EXPIRED');
    }
  }, 50);
}

function handleAnswer(selected, correct, buttonElem) {
  clearInterval(timerInterval);

  // Disable all option buttons
  const allBtns = document.querySelectorAll('.btn-option');
  allBtns.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    buttonElem.classList.add('selected-correct');
    playTone(523.25, 'sine', 0.15); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.2), 150); // E5
    floorHistory.push(true);

    setTimeout(() => {
      if (currentFloor >= 11) {
        triggerVictory();
      } else {
        currentFloor++;
        loadFloor(currentFloor);
      }
    }, 1000);
  } else {
    buttonElem.classList.add('selected-wrong');
    // Highlight the correct answer
    allBtns.forEach(btn => {
      if (btn.innerText.trim() === correct) {
        btn.classList.add('selected-correct');
      }
    });
    playTone(150, 'sawtooth', 0.35);
    floorHistory.push(false);

    setTimeout(() => {
      triggerFloorDrop(`INCORRECT ANSWER AT FLOOR ${String(currentFloor).padStart(2, '0')}`);
    }, 1200);
  }
}

function triggerVictory() {
  const gameView = document.getElementById('game-view');
  if (!gameView) return;

  playTone(880, 'triangle', 0.4);
  saveCareerStats(true, 11);

  const gridShare = floorHistory.map(h => h ? '🟩' : '🟥').join('');

  gameView.innerHTML = `
    <div class="result-card victory-card">
      <div class="result-badge">PENTHOUSE REACHED</div>
      <h2>11TH FLOOR CLEARED!</h2>
      <p>Flawless ascension to the top floor.</p>
      <div class="share-grid-box">${gridShare}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startClimb()">PLAY AGAIN</button>
        <button class="btn-secondary" onclick="resetToLobby()">MAIN MENU</button>
      </div>
    </div>
  `;
}

function triggerFloorDrop(reason) {
  const gameView = document.getElementById('game-view');
  if (!gameView) return;

  saveCareerStats(false, currentFloor);

  const gridShare = floorHistory.map(h => h ? '🟩' : '🟥').join('');

  gameView.innerHTML = `
    <div class="result-card failure-card">
      <div class="result-badge failure">ELEVATOR DROPPED</div>
      <h2>STOPPED AT FLOOR ${String(currentFloor).padStart(2, '0')}</h2>
      <p class="reason-text">${reason}</p>
      <div class="share-grid-box">${gridShare}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startClimb()">RETRY CLIMB</button>
        <button class="btn-secondary" onclick="resetToLobby()">MAIN MENU</button>
      </div>
    </div>
  `;
}

function resetToLobby() {
  clearInterval(timerInterval);
  showScreen('landing-screen');
}

function saveCareerStats(isWin, reachedFloor) {
  const statsKey = '11th_floor_stats';
  let stats = JSON.parse(localStorage.getItem(statsKey)) || {
    played: 0,
    wins: 0,
    highestFloor: 1
  };

  stats.played += 1;
  if (isWin) stats.wins += 1;
  stats.highestFloor = Math.max(stats.highestFloor, reachedFloor);

  localStorage.setItem(statsKey, JSON.stringify(stats));
}
