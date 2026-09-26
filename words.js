// 11th Floor Word Climb - Internal Dictionary Loader
// Handles network timeouts, 0-byte files, and retry logic

window.WORD_LIST = new Set();
window.WORD_LIST_LOADED = false;
window.WORD_LIST_PROMISE = null;

window.fetchDictionary = function() {
    window.WORD_LIST_PROMISE = new Promise((resolve) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout for mobile networks

        // Attempt local fetch first, fallback to a reliable public list if 0 bytes or inaccessible
        fetch('./words.txt', { signal: controller.signal })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Local words.txt file not found or inaccessible');
                }
                return response.text();
            })
            .then(text => {
                if (text.trim().length === 0) {
                    throw new Error('Local words.txt is empty (0 bytes)');
                }
                return text;
            })
            .catch(err => {
                console.warn('[11FL Dictionary] Local fetch failed/empty, attempting fallback...', err.message);
                // Fallback to a standard public English dictionary list to ensure the game works
                return fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt', { signal: controller.signal })
                    .then(res => {
                        if (!res.ok) throw new Error('Fallback dictionary inaccessible');
                        return res.text();
                    });
            })
            .then(text => {
                clearTimeout(timeoutId);
                const lines = text.split(/\r?\n/);
                window.WORD_LIST.clear();
                
                for (let i = 0; i < lines.length; i++) {
                    const trimmed = lines[i].trim().toUpperCase();
                    if (trimmed.length >= 5 && trimmed.length <= 9) {
                        window.WORD_LIST.add(trimmed);
                    }
                }
                
                if (window.WORD_LIST.size > 0) {
                    window.WORD_LIST_LOADED = true;
                    console.log(`[11FL Dictionary] Fully loaded ${window.WORD_LIST.size} valid words.`);
                    resolve(true);
                } else {
                    throw new Error('Dictionary loaded but contained no valid 5-9 letter words');
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                console.error('[11FL Dictionary] Error loading dictionary:', err);
                window.WORD_LIST_LOADED = false;
                resolve(false); // Resolve false so the UI handles the retry state cleanly
            });
    });
    return window.WORD_LIST_PROMISE;
};

// Initiate the first load attempt immediately
window.fetchDictionary();
