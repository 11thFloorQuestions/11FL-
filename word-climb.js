function handleSubmit() {
  const word = currentGuess.join('');
  const targetLength = currentFloor;

  if (word.length < targetLength) {
    showMessage(`NEED A ${targetLength}-LETTER WORD`, 'error');
    shakeSlots();
    return;
  }

  const validWords = DAILY_PUZZLE.dictionary[targetLength] || [];
  
  // STRICT DICTIONARY CHECK: Must be in validWords array
  if (validWords.includes(word)) {
    showMessage('VALID WORD! ASCENDING...', 'success');
    
    setTimeout(() => {
      if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
      } else {
        showMessage('CONGRATULATIONS! TOP FLOOR REACHED!', 'victory');
      }
    }, 1000);
  } else {
    showMessage('NOT IN WORD LIST', 'error');
    shakeSlots();
  }
}
