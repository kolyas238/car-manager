import { useState } from 'react';
import './VehicleCard.scss';

export default function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onOpenDetails,
}) {
  const [leaving, setLeaving] = useState(false);

  const handleDelete = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onDelete(vehicle.id), 500);
  };

  const records =
    (vehicle.services?.length || 0) + (vehicle.fuel?.length || 0);

  return (
    <article
      className={leaving ? 'vehicle-card vehicle-card--leaving' : 'vehicle-card'}
    >
      <div className="vehicle-card__top">
        <div className="vehicle-card__emoji">🚗</div>
        <div className="vehicle-card__heading">
          <h3 className="vehicle-card__name">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="vehicle-card__plate">
            {vehicle.plate || 'без номера'}
          </p>
        </div>
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
          className="vehicle-card__delete"
          type="button"
          disabled={leaving}
          onClick={handleDelete}
        >
          Удалить
        </button>
      </div>
    </article>
  );
}