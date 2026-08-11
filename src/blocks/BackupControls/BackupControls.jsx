import { useRef, useState } from 'react';
import { exportCatsJson, parseBackupFile } from '../../utils/backup';
import './BackupControls.scss';

export default function BackupControls({ cats, onImport }) {
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 4000);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const imported = await parseBackupFile(file);
      onImport(imported);
      showMessage(`Импортировано котиков: ${imported.length} ✅`);
    } catch {
      showMessage('Не удалось прочитать файл — это не бэкап котиков 😿');
    }
  };

  return (
    <div className="backup">
      <button
        className="backup__button"
        type="button"
        onClick={() => exportCatsJson(cats)}
      >
        💾 Экспорт базы
      </button>
      <button
        className="backup__button"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        📥 Импорт
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImport}
      />
      {message && <span className="backup__message">{message}</span>}
    </div>
  );
}