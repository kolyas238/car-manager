import './SyncStatus.scss';

const LABELS = {
  local: '🔒 локально',
  offline: '📴 офлайн',
  syncing: '☁️ синхронизация…',
  pending: '⏳ ждёт синхронизации',
  synced: '☁️ синхронизировано',
};

export default function SyncStatus({ status }) {
  return (
    <span className={`sync-status sync-status--${status}`}>
      {LABELS[status] || ''}
    </span>
  );
}