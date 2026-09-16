let archiveDeckData = {};

async function initArchiveSandbox() {
  try {
    const res = await fetch('./sandbox.01.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    archiveDeckData = data.archive_catalog || {};
  } catch (err) {
    console.error('Failed to load sandbox.01 archive catalog', err);
  }
}

// Hooked into app initialization
window.addEventListener('DOMContentLoaded', () => {
  initQuiz();
  initArchiveSandbox();
});

function launchArchiveDay(dayNum) {
  if (!archiveDeckData[dayNum]) return;
  vibrate(20);
  deck = archiveDeckData[dayNum].floors;
  closeStatsModal();
  currentFloor = 1;
  highestFloorReached = 0;
  loadFloor();
}
