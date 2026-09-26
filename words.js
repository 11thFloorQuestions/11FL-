// 11th Floor Word Climb - Internal Dictionary Loader
// Loads the full dictionary directly from your own site domain without collisions or race conditions

window.WORD_LIST = new Set();
window.WORD_LIST_LOADED = false;
window.WORD_LIST_PROMISE = null;

(function initDictionaryLoad() {
  window.WORD_LIST_PROMISE = fetch('./words.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error('Local words.txt file not found or inaccessible');
      }
      return response.text();
    })
    .then(text => {
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim().toUpperCase();
        if (trimmed.length >= 5 && trimmed.length <= 9) {
          window.WORD_LIST.add(trimmed);
        }
      }
      window.WORD_LIST_LOADED = true;
      console.log(`[11FL Dictionary] Fully loaded ${window.WORD_LIST.size} valid words.`);
      return true;
    })
    .catch(err => {
      console.error('[11FL Dictionary] Error loading dictionary:', err);
      window.WORD_LIST_LOADED = false;
      return false;
    });
})();
