// words.js - Permanent British Master Dictionary Engine
window.MASTER_DICTIONARY = new Set();
window.DICTIONARY_READY = false;

(async function initMasterDictionary() {
  try {
    // Fetches the full, exhaustive British English word list
    const response = await fetch('https://cdn.jsdelivr.net/gh/raun/Scrabble@master/words.txt');
    const text = await response.text();
    
    // Parse words and store in window.MASTER_DICTIONARY
    const words = text.split(/\r?\n/);
    for (let i = 0; i < words.length; i++) {
      const w = words[i].trim().toUpperCase();
      if (w.length >= 4) {
        window.MASTER_DICTIONARY.add(w);
      }
    }
    window.DICTIONARY_READY = true;
    console.log(`[11th Floor] Dictionary loaded: ${window.MASTER_DICTIONARY.size} words.`);
  } catch (err) {
    console.error('[11th Floor] Failed to load dictionary:', err);
  }
})();
