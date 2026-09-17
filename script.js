async function initArchiveSandbox() {
  try {
    const res = await fetch('./manifest.json?v=' + Date.now());
    if (!res.ok) return; // Safely exit without throwing if manifest is missing
    const manifest = await res.json();
    
    if (!manifest || !manifest.archives) return;

    for (const entry of manifest.archives) {
      try {
        const fileRes = await fetch(`${entry.file}?v=` + Date.now());
        if (!fileRes.ok) continue;
        const data = await fileRes.json();
        
        archiveDeckData[entry.id] = {
          title: data.title || `ARCHIVE ${entry.id}`,
          floors: data.floors
        };
      } catch (err) {
        // Suppress individual archive fetch errors so the game never breaks
      }
    }
  } catch (err) {
    // Suppress manifest errors completely so core game code always runs
  }
}
