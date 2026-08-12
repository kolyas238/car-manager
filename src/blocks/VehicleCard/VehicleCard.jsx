import { useRef, useState } from 'react';
import { vehicleAlerts } from '../../utils/reminders';
import { exportVehicleToPdf } from '../../utils/pdf';
import VehicleDossier from '../VehicleDossier/VehicleDossier';
import './VehicleCard.scss';

export default function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onOpenDetails,
  onOpenGallery,
}) {
  const [leaving, setLeaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const dossierRef = useRef(null);

  const photos = vehicle.photos || [];
  const coverPhoto = photos.find((p) => p.id === vehicle.coverPhotoId);

  const handleDelete = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onDelete(vehicle.id), 500);
  };

  const handlePdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportVehicleToPdf(vehicle, dossierRef.current);
    } catch (error) {
      console.error('Не удалось создать PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const records =
    (vehicle.services?.length || 0) + (vehicle.fuel?.length || 0);

  const { overdue, soon } = vehicleAlerts(vehicle);

  return (
    <article
      className={leaving ? 'vehicle-card vehicle-card--leaving' : 'vehicle-card'}
    >
      <div className="vehicle-card__top">
        <div className="vehicle-card__emoji">
          {coverPhoto ? (
            <img
              className="vehicle-card__cover"
              src={coverPhoto.dataUrl}
              alt={vehicle.make}
            />
          ) : (
            '🚗'
          )}
        </div>
        <div className="vehicle-card__heading">
          <h3 className="vehicle-card__name">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="vehicle-card__plate">
            {vehicle.plate || 'без номера'}
          </p>
        </div>
        {(overdue > 0 || soon > 0) && (
          <span
            className={
              overdue > 0
                ? 'vehicle-card__alert vehicle-card__alert--overdue'
                : 'vehicle-card__alert'
            }
            title={
              overdue > 0
                ? 'Есть просроченные напоминания'
                : 'Скоро обслуживание'
            }
          >
            🔔 {overdue + soon}
          </span>
        )}
      </div>

      <dl className="vehicle-card__meta">
        <div className="vehicle-card__param">
          <dt>Год</dt>
          <dd>{vehicle.year || '—'}</dd>
        </div>
        <div className="vehicle-card__param">
          <dt>Пробег</dt>
          <dd>{(vehicle.mileage || 0).toLocaleString('ru-RU')} км</dd>
        </div>
        <div className="vehicle-card__param">
          <dt>Двигатель</dt>
          <dd>{vehicle.engine || '—'}</dd>
        </div>
        <div className="vehicle-card__param">
          <dt>КПП</dt>
          <dd>{vehicle.transmission || '—'}</dd>
        </div>
      </dl>

      {vehicle.notes && (
        <p className="vehicle-card__notes">«{vehicle.notes}»</p>
      )}

      <button
        className="vehicle-card__gallery"
        type="button"
        disabled={leaving}
        onClick={() => onOpenGallery(vehicle)}
      >
        📸 Фото ({photos.length})
      </button>

      <button
        className="vehicle-card__details"
        type="button"
        disabled={leaving}
        onClick={() => onOpenDetails(vehicle)}
      >
        📋 История ({records})
      </button>

      <div className="vehicle-card__actions">
        <button
          className="vehicle-card__edit"
          type="button"
          disabled={leaving}
          onClick={() => onEdit(vehicle)}
        >
          Изменить
        </button>
        <button
          className="vehicle-card__pdf"
          type="button"
          disabled={exporting || leaving}
          onClick={handlePdf}
        >
          {exporting ? '⏳ PDF…' : '📄 PDF'}
        </button>
        <button
          className="vehicle-card__delete"
          type="button"
          disabled={leaving}
          onClick={handleDelete}
        >
          Удалить
        </button>
      </div>

      {/* скрытое досье для рендера в PDF */}
      <VehicleDossier vehicle={vehicle} innerRef={dossierRef} />
    </article>
  );
}