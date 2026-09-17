async function prepareActiveDeck() {
  if (!deck || deck.length === 0) {
    await initQuiz();
  }
  activeFloorDeck = deck.map((f, floorIndex) => {
    const rawOptions = f.options || [];
    // f.answer is the text string, so we find its correct text directly
    const correctText = typeof f.answer === 'number' ? rawOptions[f.answer] : f.answer;
    
    let shuffledOpts = [...rawOptions];
    shuffledOpts.sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOpts.indexOf(correctText);

    return {
      floorNum: floorIndex + 1,
      tier: f.tier || `FLOOR ${String(floorIndex + 1).padStart(2, '0')}`,
      q: f.question,
      opts: shuffledOpts,
      c: correctIndex >= 0 ? correctIndex : 0
    };
  });
}
