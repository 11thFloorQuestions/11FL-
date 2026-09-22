// 11th Floor Word Climb - Internal Dictionary Loader
// Loads the full dictionary directly from your own site domain (No CORS blocks, no lag)

window.WORD_LIST = new Set();
window.WORD_LIST_LOADED = false;

(function loadDictionary() {
  // Fetches words.txt directly from your own Vercel deployment
  fetch('./words.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error('Local dictionary file not found');
      }
      return response.text();
    })
    .then(text => {
      const lines = text.split(/\r?\n/);
      lines.forEach(word => {
        const trimmed = word.trim().toUpperCase();
        if (trimmed.length > 0) {
          window.WORD_LIST.add(trimmed);
        }
      });
      window.WORD_LIST_LOADED = true;
      console.log(`[11FL Dictionary] Fully loaded ${window.WORD_LIST.size} words.`);
    })
    .catch(err => {
      console.error('[11FL Dictionary] Error loading dictionary:', err);
    });
})();
