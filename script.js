let archiveId = 1;

while (archiveId <= 50) {
    const paddedId = String(archiveId).padStart(2, '0');
    const filename = `sandbox.${paddedId}.json`;
    // ...
    archiveId++;
}
