function handleSubmission() {
    const word = currentWordString.trim().toUpperCase();
    if (!word) return;

    const requiredLength = getRequiredWordLength(currentFloorData.floor);

    // 1. Check length
    if (word.length !== requiredLength) {
        showMessage(`Must be ${requiredLength} letters!`, true);
        currentWordString = "";
        renderGuessDisplay();
        return;
    }

    if (foundWords.has(word)) {
        showMessage(`Already found '${word}'!`, true);
        currentWordString = "";
        renderGuessDisplay();
        return;
    }

    // 2. Check if the word can be formed from the persistent letter wheel (allowing reuse)
    const availableLetters = masterLetters.toUpperCase();
    let isValidFromWheel = true;
    for (let char of word) {
        if (!availableLetters.includes(char)) {
            isValidFromWheel = false;
            break;
        }
    }

    if (isValidFromWheel) {
        foundWords.add(word);
        showMessage(`Correct! '${word}'`, false);
        displaySolvedWordInSlots(word);

        // Advance to the next floor immediately
        setTimeout(() => {
            const nextFloor = Math.min(currentFloorData.floor + 1, 11);
            loadAndPlayFloor(nextFloor);
        }, 1200);
    } else {
        showMessage(`'${word}' uses invalid letters.`, true);
    }

    currentWordString = "";
    renderGuessDisplay();
}
