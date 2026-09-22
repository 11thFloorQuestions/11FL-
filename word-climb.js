function handleSubmit() {
  if (isTransitioning) return;

  const word = currentGuess.join('').toUpperCase();
  const targetLength = currentFloor;

  // 1. Must match current floor length
  if (word.length < targetLength) {
    showMessage(`NEED A ${targetLength}-LETTER WORD`, 'error');
    return;
  }

  // 2. Must only use letters on the wheel
  const usesValidLetters = word.split('').every(char => DAILY_PUZZLE.letters.includes(char));

  if (!usesValidLetters) {
    showMessage('INVALID LETTERS USED', 'error');
    return;
  }

  // 3. Check against full British Dictionary
  // (Assuming window.MASTER_DICTIONARY is loaded)
  const isRealWord = window.MASTER_DICTIONARY ? window.MASTER_DICTIONARY.has(word) : false;

  if (isRealWord) {
    isTransitioning = true;
    showMessage('VALID WORD! ASCENDING...', 'success');
    
    setTimeout(() => {
      if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
      } else {
        showMessage('TOP FLOOR REACHED!', 'victory');
      }
      isTransitioning = false;
    }, 1000);
  } else {
    showMessage('NOT IN WORD LIST', 'error');
  }
}
