function triggerVictory() {
  highestFloorReached = activeFloorDeck.length;
  renderBldg('floor-counter', activeFloorDeck.length);
  setTimeout(() => {
    vibrate([40, 50, 60]);
    playHotelBellDing();
    recordStats(true, activeFloorDeck.length);
    generateShareText('win');
    resetToLobby();
  }, 400);
}

function fail(reason) {
  clearInterval(timer);
  vibrate([60, 40, 60]);
  const dropFloor = highestFloorReached + 1;
  recordStats(false, dropFloor);
  generateShareText('fail');
  resetToLobby();
}
