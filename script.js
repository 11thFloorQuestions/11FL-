let currentFloorIdx = 0;
let score = 0;
let quizData = null;
const optionLabels = ['A', 'B', 'C', 'D'];

async function initGame() {
  try {
    const res = await fetch('./questions.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    quizData = await res.json();
    renderFloor();
  } catch (err) {
    console.error('Failed to load questions.json', err);
    document.getElementById('game-view').innerHTML = `<p style="color:#ef476f;">Failed to load quiz data.</p>`;
  }
}

function renderFloor() {
  const container = document.getElementById('game-view');
  const counter = document.getElementById('floor-counter');
  if (!quizData || currentFloorIdx >= quizData.floors.length) {
    renderFinalScreen();
    return;
  }
  const floorData = quizData.floors[currentFloorIdx];
  counter.textContent = `FLOOR ${String(currentFloorIdx + 1).padStart(2, '0')} / 10`;
  const optionsHTML = floorData.options.map((opt, i) => `
    <button class="choice-btn" onclick="handleChoice(${i})">
      <strong>${optionLabels[i]})</strong> ${opt}
    </button>
  `).join('');
  container.innerHTML = `
    <div class="tier-badge">${floorData.tier} (${floorData.choicesCount} choices)</div>
    <div class="question-text">${floorData.question}</div>
    <div class="choices-stack">${optionsHTML}</div>
  `;
}

function handleChoice(selectedIndex) {
  const floorData = quizData.floors[currentFloorIdx];
  const buttons = document.querySelectorAll('.choice-btn');
  const isCorrect = selectedIndex === floorData.answer;
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === floorData.answer) btn.classList.add('selected-correct');
    if (idx === selectedIndex && !isCorrect) btn.classList.add('selected-wrong');
  });
  if (isCorrect) score++;
  setTimeout(() => {
    currentFloorIdx++;
    renderFloor();
  }, 750);
}

function renderFinalScreen() {
  const container = document.getElementById('game-view');
  document.getElementById('floor-counter').textContent = `CLIMB COMPLETE`;
  saveStats(score);
  container.innerHTML = `
    <div class="final-screen-container">
      <h2>Summit Reached</h2>
      <div class="score-display">${score} / 10</div>
      <div>
        <button class="primary-btn" onclick="restartRun()">Run Again</button>
        <button class="secondary-btn" onclick="openStatsModal()" style="margin-top:12px;">Stats & History</button>
      </div>
    </div>
  `;
}

function restartRun() { currentFloorIdx = 0; score = 0; renderFloor(); }
function saveStats(runScore) {
  try {
    const history = JSON.parse(localStorage.getItem('eleventh_floor_stats') || '[]');
    history.push({ date: new Date().toISOString().split('T')[0], score: runScore });
    localStorage.setItem('eleventh_floor_stats', JSON.stringify(history));
  } catch (e) {}
}

function openStatsModal() {
  const modal = document.getElementById('stats-modal');
  const body = document.getElementById('stats-body');
  let history = [];
  try { history = JSON.parse(localStorage.getItem('eleventh_floor_stats') || '[]'); } catch (e) {}
  const totalRuns = history.length;
  const avgScore = totalRuns ? (history.reduce((a, b) => a + (b.score || 0), 0) / totalRuns).toFixed(1) : 0;
  const bestScore = totalRuns ? Math.max(...history.map(h => h.score || 0)) : 0;
  body.innerHTML = `
    <p><strong>Total Runs:</strong> ${totalRuns}</p>
    <p><strong>Best Summit:</strong> ${bestScore} / 10</p>
    <p><strong>Average Score:</strong> ${avgScore}</p>
  `;
  modal.classList.remove('hidden');
}
function closeStatsModal() { document.getElementById('stats-modal').classList.add('hidden'); }
window.addEventListener('DOMContentLoaded', initGame);
