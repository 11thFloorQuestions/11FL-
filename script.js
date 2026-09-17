async function initArchiveSandbox() {
  try {
    const res = await fetch('./manifest.json?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load manifest.json');
    const manifest = await res.json();
    
    // Loop through every archive defined in the manifest file
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
        console.error(`Failed to load archive file: ${entry.file}`, err);
      }
    }
  } catch (err) {
    console.error('Failed to load manifest.json', err);
  }
}
