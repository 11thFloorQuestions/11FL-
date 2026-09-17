async function initArchiveSandbox() {
  try {
    const res = await fetch('./manifest.json?v=' + Date.now());
    if (!res.ok) return;
    const manifest = await res.json();
    
    if (!manifest || !manifest.archives) return;

    for (const entry of manifest.archives) {
      try {
        const fileRes = await fetch(`./${entry.file}?v=` + Date.now());
        if (!fileRes.ok) continue;
        const data = await fileRes.json();
        
        // Use a clean key (e.g. 01, 02) derived from the file path to avoid dot/string mismatch
        const cleanId = entry.file.replace(/[^0-9]/g, '');
        
        archiveDeckData[cleanId] = {
          title: data.title || `ARCHIVE ${entry.id}`,
          floors: data.floors
        };
      } catch (err) {}
    }
  } catch (err) {}
}
