let deck = [];
let currentFloor = 1, timer = null, left = 15, locked = false, highestFloorReached = 0;
let audioEnabled = false, audioCtx = null;
let activeFloorDeck = [];

async function initQuiz() {
  try {
    const res = await fetch('./questions.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    deck = data.floors || data;
  } catch (err) {
    console.error('Failed to load questions.json', err);
  }
}
window.addEventListener('DOMContentLoaded', initQuiz);

function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch(e){}
  }
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  vibrate(15);
  document.querySelectorAll('.btn-audio-toggle').forEach(btn => {
    btn.innerText = audioEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    btn.classList.toggle('active', audioEnabled);
  });
}

function recordStats(isWin, highestFloor) {
  const stats = JSON.parse(localStorage.getItem('11fl_stats') || '{"played":0,"wins":0,"currentStreak":0,"maxStreak":0,"floorDrops":[0,0,0,0,0,0,0,0,0,0,0]}');
  stats.played++;
  if (isWin) {
    stats.wins++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.floorDrops[10]++;
  } else {
    stats.currentStreak = 0;
    const dropIdx = Math.min(Math.max(highestFloor - 1, 0), 10);
    stats.floorDrops[dropIdx]++;
  }
  localStorage.setItem('11fl_stats', JSON.stringify(stats));
}

function openArchive() {
  vibrate(15);
  const stats = JSON.parse(localStorage.getItem('11fl_stats') || '{"played":0,"wins":0,"currentStreak":0,"maxStreak":0,"floorDrops":[0,0,0,0,0,0,0,0,0,0,0]}');
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const historyItem = localStorage.getItem('11fl_last_result');
  const maxDrop = Math.max(1, ...stats.floorDrops);
  
  const logEl = document.getElementById('archive-log-text');
  if (logEl) {
    logEl.innerHTML = `
      <div style="display:flex; justify-content:space-around; text-align:center; margin-bottom:14px; padding:10px 0; border-bottom:1px solid #262626;">
        <div><div style="font-size:1.3rem; font-weight:800; color:#fff;">${stats.played}</div><div style="font-size:0.55rem;">PLAYED</div></div>
        <div><div style="font-size:1.3rem; font-weight:800; color:#fff;">${winPct}%</div><div style="font-size:0.55rem;">WIN %</div></div>
        <div><div style="font-size:1.3rem; font-weight:800; color:#fff;">${stats.currentStreak}</div><div style="font-size:0.55rem;">STREAK</div></div>
        <div><div style="font-size:1.3rem; font-weight:800; color:#fff;">${stats.maxStreak}</div><div style="font-size:0.55rem;">MAX</div></div>
      </div>
      <div style="font-size:0.6rem; color:#fff; font-weight:700; margin-bottom:6px; letter-spacing:1px;">FLOOR DROP PROFILE</div>
      <div style="display:flex; flex-direction:column; gap:3px; margin-bottom:12px;">
        ${stats.floorDrops.map((count, i) => `
          <div style="display:flex; align-items:center; gap:6px; font-size:0.6rem;">
            <span style="width:22px; color:var(--text-muted);">F${String(i+1).padStart(2,'0')}</span>
            <div style="flex:1; background:#141414; height:5px; border-radius:2px; overflow:hidden;">
              <div style="background:var(--accent-red); width:${Math.min(100, (count / maxDrop) * 100)}%; height:100%;"></div>
            </div>
            <span style="width:14px; text-align:right;">${count}</span>
          </div>
        `).join('')}
      </div>
      <div style="font-size:0.6rem; color:var(--text-muted); border-top:1px solid #262626; padding-top:10px;">
        <strong>Last Run:</strong><br><pre style="font-family:inherit; margin-top:2px;">${historyItem || 'No prior daily logs recorded yet.'}</pre>
      </div>
    `;
  }
  show('screen-archive');
}

function playTone(freq, type='sine', duration=0.1, gainVal=0.08) {
  if (!audioEnabled) return;
  try {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e){}
}

function playHotelBellDing() {
  if (!audioEnabled) return;
  try {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2600, now);
    osc1.frequency.exponentialRampToValueAtTime(2480, now + 0.45);
    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);
  } catch(e){}
}

function getStreak() { return parseInt(localStorage.getItem('11fl_streak') || '0', 10); }

function updateStreakOnWin() {
  let streak = getStreak() + 1;
  localStorage.setItem('11fl_streak', streak);
  const streakEl = document.getElementById('victory-streak');
  if (streakEl) streakEl.innerText = `Streak: 🔥 ${streak} day${streak > 1 ? 's' : ''}`;
}

function renderBldg(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for(let i=1; i<=10; i++){
    const b = document.createElement('div');
    b.className = 'floor-block' + (i<active?' completed':'') + (i===active?' active-floor':'');
    el.appendChild(b);
  }
}

function buildGridString(clearedFloorCount) {
  let blocks = '';
  for(let i=1; i<=10; i++) { blocks += (i <= clearedFloorCount) ? '■' : '□'; }
  return `[${blocks}]`;
}

function show(id) { 
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active'); 
}

async function prepareActiveDeck() {
  if (!deck || deck.length === 0) {
    await initQuiz();
  }
  // Maps your JSON questions directly without breaking answer indices
  activeFloorDeck = deck.map((f, floorIndex) => {
    return {
      floorNum: floorIndex + 1,
      tier: f.tier || `FLOOR ${floorIndex + 1}`,
      q: f.question,
      opts: f.options,
      c: f.answer
    };
  });
}

async function startClimb() {
  vibrate(20);
  await prepareActiveDeck();
  if (!activeFloorDeck || activeFloorDeck.length === 0) {
    alert("Questions failed to load. Check questions.json format.");
    return;
  }
  currentFloor = 1;
  highestFloorReached = 0;
  loadFloor();
}

function loadFloor() {
  locked = false;
  show('screen-game');
  const rawD = activeFloorDeck[currentFloor - 1];
  if (!rawD) {
    // End of game victory if beyond available floors
    triggerVictory();
    return;
  }

  const floorLabel = document.getElementById('hud-floor-label');
  if (floorLabel) floorLabel.innerText = rawD.tier || `FLOOR ${currentFloor < 10 ? '0'+currentFloor : currentFloor}`;
  
  renderBldg('building-game', currentFloor);
  
  const qText = document.getElementById('question-text');
  if (qText) qText.innerText = `${currentFloor}. ${rawD.q}`;
  
  const opts = document.getElementById('options-container');
  if (opts) {
    opts.style.display = 'flex'; 
    opts.innerHTML = '';
    rawD.opts.forEach((o, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option'; 
      btn.innerText = o;
      btn.onclick = () => answer(i, rawD.c, btn);
      opts.appendChild(btn);
    });
  }
  startTimer();
}

function startTimer() {
  if(timer) clearInterval(timer);
  left = 15;
  const bar = document.getElementById('timer-bar');
  if (bar) bar.style.width = '100%';
  timer = setInterval(()=>{
    left--;
    if (bar) bar.style.width = Math.max(0, left/15*100) + '%';
    if(left<=0){ clearInterval(timer); fail('Time expired.'); }
  },1000);
}

function answer(sel, corr, btn) {
  if(locked) return;
  locked = true;
  clearInterval(timer);
  if(sel === corr) {
    highestFloorReached = currentFloor;
    btn.classList.add('selected-correct');
    vibrate(15);
    playHotelBellDing();
    setTimeout(()=>{
      if(currentFloor >= activeFloorDeck.length) { 
        triggerVictory();
      } else {
        currentFloor++; 
        loadFloor();
      }
    }, 600);
  } else {
    btn.classList.add('selected-wrong');
    vibrate([40, 30, 40]);
    playTone(150, 'sawtooth', 0.2, 0.08);
    setTimeout(()=>fail('Wrong choice.'), 500);
  }
}

function triggerVictory() {
  highestFloorReached = activeFloorDeck.length;
  renderBldg('building-game', activeFloorDeck.length);
  setTimeout(() => {
    vibrate([40, 50, 60]);
    playHotelBellDing();
    recordStats(true, activeFloorDeck.length);
    updateStreakOnWin();
    generateShareText('win');
    show('screen-victory');
  }, 400);
}

function fail(reason) {
  clearInterval(timer);
  vibrate([60, 40, 60]);
  const dropFloor = highestFloorReached + 1;
  recordStats(false, dropFloor);
  generateShareText('fail');
  show('screen-gameover');
}

function generateShareText(type) {
  const grid = buildGridString(highestFloorReached);
  const txt = type === 'win' ? `11FL? // Cleared\n${grid}` : `11FL? // Drop F${String(highestFloorReached+1).padStart(2,'0')}\n${grid}`;
  localStorage.setItem('11fl_last_result', txt);
  return txt;
}

function shareResult(type) {
  vibrate(15);
  const text = generateShareText(type);
  if(navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(()=>alert('Copied result.')).catch(()=>prompt('Copy result:', text));
  } else {
    prompt('Copy result:', text);
  }
}

function resetToLobby() { 
  clearInterval(timer); 
  vibrate(15);
  show('screen-landing'); 
  renderBldg('building-landing', 0); 
}

renderBldg('building-landing', 0);
