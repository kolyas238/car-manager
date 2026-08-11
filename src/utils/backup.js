export function exportCatsJson(cats) {
  const payload = {
    app: 'cat-manager',
    version: 1,
    exportedAt: new Date().toISOString(),
    cats,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `cat-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.cats)) throw new Error('bad format');
        resolve(data.cats);
      } catch {
        reject(new Error('not a backup'));
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}