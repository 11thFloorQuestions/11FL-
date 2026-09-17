async function initArchiveSandbox() {
  for (let i = 1; i <= 8; i++) {
    const padNum = String(i).padStart(2, '0');
    try {
      const res = await fetch(`./archives/sandbox.${padNum}.json?v=` + Date.now());
      if (!res.ok) continue;
      const data = await res.json();
      
      archiveDeckData[i] = {
        title: data.title || `ARCHIVE ${padNum}`,
        floors: data.floors
      };
    } catch (err) {}
  }
}
