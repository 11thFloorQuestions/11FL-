// Complete Expanded Dictionary Loader for 11th Floor Word Climb
// Fetches the full Official Scrabble / SOWPODS dictionary (includes SAUNTERED, plurals, tenses)

(function() {
  window.WORD_LIST_LOADED = false;
  window.WORD_LIST = new Set();

  // Comprehensive SOWPODS / Collins Official Word List URL
  const DICTIONARY_URL = 'https://cdn.jsdelivr.net/gh/raun/Scrabble@master/words.txt';

  fetch(DICTIONARY_URL)
    .then(response => response.text())
    .then(text => {
      const words = text.toUpperCase().split(/\r?\n/);
      words.forEach(word => {
        if (word.trim().length > 0) {
          window.WORD_LIST.add(word.trim());
        }
      });
      window.WORD_LIST_LOADED = true;
      console.log(`[11FL Dictionary] Loaded ${window.WORD_LIST.size} valid words.`);
    })
    .catch(err => {
      console.error('[11FL Dictionary] Error loading extended word list:', err);
    });
})();
