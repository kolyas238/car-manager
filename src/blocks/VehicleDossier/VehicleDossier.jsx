import { formatDate } from '../../utils/format';
import './VehicleDossier.scss';

const money = (n) => `${(n || 0).toLocaleString('ru-RU')} ₽`;

export default function VehicleDossier({ vehicle, innerRef }) {
  const services = [...(vehicle.services || [])].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );
  const fuel = [...(vehicle.fuel || [])].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );

  const serviceTotal = services.reduce((sum, r) => sum + (r.cost || 0), 0);
  const fuelTotal = fuel.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="vehicle-dossier" ref={innerRef}>
      <header className="vehicle-dossier__header">
        <h1>
          🚗 {vehicle.make} {vehicle.model}
        </h1>
        <p>
          {[
            vehicle.plate,
            vehicle.year && `${vehicle.year} г.`,
            vehicle.vin && `VIN ${vehicle.vin}`,
            `${(vehicle.mileage || 0).toLocaleString('ru-RU')} км`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      <div className="vehicle-dossier__stats">
        <div>
          <span>ТО и ремонты</span>
          <b>{money(serviceTotal)}</b>
        </div>
        <div>
          <span>Топливо</span>
          <b>{money(fuelTotal)}</b>
        </div>
        <div>
          <span>Итого</span>
          <b>{money(serviceTotal + fuelTotal)}</b>
        </div>
      </div>

      <h2>🔧 История обслуживания и ремонтов</h2>
      {services.length === 0 ? (
        <p className="vehicle-dossier__empty">Записей об обслуживании нет.</p>
      ) : (
        <table className="vehicle-dossier__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пробег</th>
              <th>Работа</th>
              <th>Сервис</th>
              <th>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{formatDate(s.date)}</td>
                <td>{(s.mileage || 0).toLocaleString('ru-RU')}</td>
                <td>{s.title}</td>
                <td>{s.shop || '—'}</td>
                <td>{money(s.cost)}</td>
              </tr>
            ))}
            <tr className="vehicle-dossier__total">
              <td colSpan={4}>Итого</td>
              <td>{money(serviceTotal)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <h2>⛽ Топливо</h2>
      {fuel.length === 0 ? (
        <p className="vehicle-dossier__empty">Записей о заправках нет.</p>
      ) : (
        <table className="vehicle-dossier__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пробег</th>
              <th>Литры</th>
              <th>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {fuel.map((f) => (
              <tr key={f.id}>
                <td>{formatDate(f.date)}</td>
                <td>{(f.mileage || 0).toLocaleString('ru-RU')}</td>
                <td>{f.liters}</td>
                <td>{money(f.cost)}</td>
              </tr>
            ))}
            <tr className="vehicle-dossier__total">
              <td colSpan={3}>Итого</td>
              <td>{money(fuelTotal)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <footer className="vehicle-dossier__footer">
        Сформировано в «Менеджере автомобилей» ·{' '}
        {formatDate(new Date().toISOString().slice(0, 10))}
      </footer>
    </div>
  );
}