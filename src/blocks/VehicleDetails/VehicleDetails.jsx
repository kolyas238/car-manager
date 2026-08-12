import { useEffect, useState } from 'react';
import { reminderStatus } from '../../utils/reminders';
import { partSearchLinks } from '../../utils/partLinks';
import './VehicleDetails.scss';

const today = () => new Date().toISOString().slice(0, 10);

const fmtMoney = (n) => `${(n || 0).toLocaleString('ru-RU')} ₽`;

const STATUS_ORDER = { overdue: 0, soon: 1, planned: 2, done: 3 };

const STATUS_LABEL = {
  overdue: 'просрочено',
  soon: 'скоро',
  planned: 'в плане',
  done: 'готово',
};

export default function VehicleDetails({
  vehicle,
  onClose,
  onAddService,
  onDeleteService,
  onAddFuel,
  onDeleteFuel,
  onAddReminder,
  onDeleteReminder,
  onToggleReminder,
  onAddPart, 
  onDeletePart,
}) {
  const [tab, setTab] = useState('service');
  const [serviceForm, setServiceForm] = useState({
    date: today(), mileage: '', title: '', shop: '', cost: '', notes: '',
  });
  const [fuelForm, setFuelForm] = useState({
    date: today(), mileage: '', liters: '', cost: '',
  });
  const [reminderForm, setReminderForm] = useState({
    title: '', dueDate: '', dueMileage: '',
  });
  const [partForm, setPartForm] = useState({
    name: '', article: '', price: '', shop: '',
  });

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const services = vehicle.services || [];
  const fuel = vehicle.fuel || [];
  const reminders = vehicle.reminders || [];
  const parts = vehicle.parts || [];

  const submitService = (event) => {
    event.preventDefault();
    if (!serviceForm.title.trim()) return;
    onAddService(vehicle.id, {
      date: serviceForm.date,
      mileage: Number(serviceForm.mileage) || 0,
      title: serviceForm.title.trim(),
      shop: serviceForm.shop.trim(),
      cost: Number(serviceForm.cost) || 0,
      notes: serviceForm.notes.trim(),
    });
    setServiceForm({ date: today(), mileage: '', title: '', shop: '', cost: '', notes: '' });
  };

  const submitFuel = (event) => {
    event.preventDefault();
    if (!fuelForm.liters) return;
    onAddFuel(vehicle.id, {
      date: fuelForm.date,
      mileage: Number(fuelForm.mileage) || 0,
      liters: Number(fuelForm.liters) || 0,
      cost: Number(fuelForm.cost) || 0,
    });
    setFuelForm({ date: today(), mileage: '', liters: '', cost: '' });
  };

  const submitReminder = (event) => {
    event.preventDefault();
    if (!reminderForm.title.trim()) return;
    onAddReminder(vehicle.id, {
      title: reminderForm.title.trim(),
      dueDate: reminderForm.dueDate || null,
      dueMileage: Number(reminderForm.dueMileage) || null,
    });
    setReminderForm({ title: '', dueDate: '', dueMileage: '' });
  };

  const submitPart = (event) => {
    event.preventDefault();
    if (!partForm.name.trim()) return;
    onAddPart(vehicle.id, {
      name: partForm.name.trim(),
      article: partForm.article.trim().toUpperCase(),
      price: Number(partForm.price) || 0,
      shop: partForm.shop.trim(),
    });
    setPartForm({ name: '', article: '', price: '', shop: '' });
  };

  // ─── статистика ───
  const serviceTotal = services.reduce((sum, r) => sum + (r.cost || 0), 0);
  const fuelTotal = fuel.reduce((sum, r) => sum + (r.cost || 0), 0);
  const litersTotal = fuel.reduce((sum, r) => sum + (r.liters || 0), 0);

  const byMileage = [...fuel]
    .filter((f) => f.mileage > 0)
    .sort((a, b) => a.mileage - b.mileage);
  const consumptions = [];
  for (let i = 1; i < byMileage.length; i += 1) {
    const dKm = byMileage[i].mileage - byMileage[i - 1].mileage;
    if (dKm > 0) consumptions.push((byMileage[i].liters / dKm) * 100);
  }
  const avgConsumption = consumptions.length
    ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
    : null;

  const allMileages = [
    ...services.map((r) => r.mileage),
    ...fuel.map((r) => r.mileage),
  ].filter((m) => m > 0);
  const kmSpan = allMileages.length
    ? Math.max(...allMileages) - Math.min(...allMileages)
    : 0;
  const costPerKm = kmSpan > 0 ? (serviceTotal + fuelTotal) / kmSpan : null;

  const sortedReminders = [...reminders].sort(
    (a, b) =>
      STATUS_ORDER[reminderStatus(a, vehicle)] -
      STATUS_ORDER[reminderStatus(b, vehicle)]
  );

  return (
    <div className="vehicle-details" onClick={onClose}>
      <div
        className="vehicle-details__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="vehicle-details__header">
          <h3 className="vehicle-details__title">
            📋 {vehicle.make} {vehicle.model}
            {vehicle.plate && (
              <span className="vehicle-details__plate">{vehicle.plate}</span>
            )}
          </h3>
          <button
            className="vehicle-details__close"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="vehicle-details__tabs">
          <button
            type="button"
            className={tab === 'service' ? 'active' : ''}
            onClick={() => setTab('service')}
          >
            🔧 ТО ({services.length})
          </button>
          <button
            type="button"
            className={tab === 'fuel' ? 'active' : ''}
            onClick={() => setTab('fuel')}
          >
            ⛽ Топливо ({fuel.length})
          </button>
          <button
            type="button"
            className={tab === 'reminders' ? 'active' : ''}
            onClick={() => setTab('reminders')}
          >
            🔔 Напоминания ({reminders.length})
          </button>
          <button
            type="button"
            className={tab === 'parts' ? 'active' : ''}
            onClick={() => setTab('parts')}
          >
            🔩 Запчасти ({parts.length})
          </button>
          <button
            type="button"
            className={tab === 'stats' ? 'active' : ''}
            onClick={() => setTab('stats')}
          >
            📊 Сводка
          </button>
        </div>

        {tab === 'service' && (
          <div className="vehicle-details__tab">
            <form className="vehicle-details__form" onSubmit={submitService}>
              <input
                type="date"
                value={serviceForm.date}
                onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Пробег, км"
                value={serviceForm.mileage}
                onChange={(e) => setServiceForm({ ...serviceForm, mileage: e.target.value })}
              />
              <input
                placeholder="Работа: замена масла…"
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                required
              />
              <input
                placeholder="Сервис"
                value={serviceForm.shop}
                onChange={(e) => setServiceForm({ ...serviceForm, shop: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Стоимость, ₽"
                value={serviceForm.cost}
                onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
              />
              <button type="submit">➕ Добавить</button>
            </form>

            {services.length === 0 ? (
              <p className="vehicle-details__empty">Записей пока нет.</p>
            ) : (
              <ul className="vehicle-details__list">
                {services.map((s) => (
                  <li key={s.id} className="vehicle-details__row">
                    <div className="vehicle-details__row-main">
                      <b>{s.title}</b>
                      <span className="vehicle-details__row-meta">
                        {s.date} · {(s.mileage || 0).toLocaleString('ru-RU')} км
                        {s.shop && ` · ${s.shop}`}
                      </span>
                      {s.notes && (
                        <span className="vehicle-details__row-meta">{s.notes}</span>
                      )}
                    </div>
                    <div className="vehicle-details__row-side">
                      <b>{fmtMoney(s.cost)}</b>
                      <button
                        type="button"
                        title="Удалить запись"
                        onClick={() => onDeleteService(vehicle.id, s.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'fuel' && (
          <div className="vehicle-details__tab">
            <form className="vehicle-details__form" onSubmit={submitFuel}>
              <input
                type="date"
                value={fuelForm.date}
                onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Пробег, км"
                value={fuelForm.mileage}
                onChange={(e) => setFuelForm({ ...fuelForm, mileage: e.target.value })}
              />
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Литры"
                value={fuelForm.liters}
                onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Стоимость, ₽"
                value={fuelForm.cost}
                onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
              />
              <button type="submit">➕ Добавить</button>
            </form>

            {fuel.length === 0 ? (
              <p className="vehicle-details__empty">Заправок пока нет.</p>
            ) : (
              <ul className="vehicle-details__list">
                {fuel.map((f) => (
                  <li key={f.id} className="vehicle-details__row">
                    <div className="vehicle-details__row-main">
                      <b>⛽ {f.liters} л</b>
                      <span className="vehicle-details__row-meta">
                        {f.date} · {(f.mileage || 0).toLocaleString('ru-RU')} км
                      </span>
                    </div>
                    <div className="vehicle-details__row-side">
                      <b>{fmtMoney(f.cost)}</b>
                      <button
                        type="button"
                        title="Удалить запись"
                        onClick={() => onDeleteFuel(vehicle.id, f.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'reminders' && (
          <div className="vehicle-details__tab">
            <form className="vehicle-details__form" onSubmit={submitReminder}>
              <input
                placeholder="Например: замена масла"
                value={reminderForm.title}
                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                required
              />
              <input
                type="date"
                value={reminderForm.dueDate}
                onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Пробег-порог, км"
                value={reminderForm.dueMileage}
                onChange={(e) => setReminderForm({ ...reminderForm, dueMileage: e.target.value })}
              />
              <button type="submit">➕ Добавить</button>
            </form>

            {reminders.length === 0 ? (
              <p className="vehicle-details__empty">
                Напоминаний нет. Добавь: масло, ОСАГО, техосмотр, шиномонтаж…
              </p>
            ) : (
              <ul className="vehicle-details__list">
                {sortedReminders.map((r) => {
                  const status = reminderStatus(r, vehicle);
                  return (
                    <li
                      key={r.id}
                      className={`vehicle-details__reminder vehicle-details__reminder--${status}`}
                    >
                      <div className="vehicle-details__row-main">
                        <b className={r.done ? 'vehicle-details__done-text' : ''}>
                          {r.title}
                        </b>
                        <span className="vehicle-details__row-meta">
                          {r.dueDate && `до ${r.dueDate} `}
                          {r.dueMileage && `до ${r.dueMileage.toLocaleString('ru-RU')} км`}
                        </span>
                      </div>
                      <div className="vehicle-details__row-side">
                        <span className={`vehicle-details__chip vehicle-details__chip--${status}`}>
                          {STATUS_LABEL[status]}
                        </span>
                        <button
                          type="button"
                          title={r.done ? 'Вернуть в работу' : 'Отметить выполненным'}
                          onClick={() => onToggleReminder(vehicle.id, r.id)}
                        >
                          {r.done ? '↩️' : '✅'}
                        </button>
                        <button
                          type="button"
                          title="Удалить"
                          onClick={() => onDeleteReminder(vehicle.id, r.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {tab === 'parts' && (
          <div className="vehicle-details__tab">
            <form className="vehicle-details__form" onSubmit={submitPart}>
              <input
                placeholder="Название: фильтр масляный…"
                value={partForm.name}
                onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                required
              />
              <input
                placeholder="Артикул"
                value={partForm.article}
                onChange={(e) => setPartForm({ ...partForm, article: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Цена, ₽"
                value={partForm.price}
                onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
              />
              <input
                placeholder="Магазин"
                value={partForm.shop}
                onChange={(e) => setPartForm({ ...partForm, shop: e.target.value })}
              />
              <button type="submit">➕ Добавить</button>
            </form>

            {parts.length === 0 ? (
              <p className="vehicle-details__empty">
                Запчастей пока нет. Добавь с артикулом — появятся кнопки поиска
                по магазинам.
              </p>
            ) : (
              <ul className="vehicle-details__list">
                {parts.map((p) => (
                  <li key={p.id} className="vehicle-details__row">
                    <div className="vehicle-details__row-main">
                      <b>{p.name}</b>
                      <span className="vehicle-details__row-meta">
                        {p.article && `арт. ${p.article} `}
                        {p.shop && `· ${p.shop} `}
                        {p.price > 0 && `· ${fmtMoney(p.price)}`}
                      </span>
                      {p.article && (
                        <span className="vehicle-details__part-links">
                          {partSearchLinks(p.article).map((s) => (
                            <a
                              key={s.label}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              🔎 {s.label}
                            </a>
                          ))}
                        </span>
                      )}
                    </div>
                    <div className="vehicle-details__row-side">
                      <button
                        type="button"
                        title="Удалить"
                        onClick={() => onDeletePart(vehicle.id, p.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="vehicle-details__stats">
            <div className="vehicle-details__stat">
              <span>ТО и ремонты</span>
              <b>{fmtMoney(serviceTotal)}</b>
            </div>
            <div className="vehicle-details__stat">
              <span>Топливо</span>
              <b>{fmtMoney(fuelTotal)} · {litersTotal.toLocaleString('ru-RU')} л</b>
            </div>
            <div className="vehicle-details__stat">
              <span>Средний расход</span>
              <b>{avgConsumption ? `${avgConsumption.toFixed(1)} л/100 км` : '—'}</b>
            </div>
            <div className="vehicle-details__stat">
              <span>Стоимость 1 км</span>
              <b>{costPerKm ? `${costPerKm.toFixed(2)} ₽/км` : '—'}</b>
            </div>
            <p className="vehicle-details__hint">
              Расход считается по парам заправок с пробегом, стоимость км — по
              размаху пробегов в записях. Чем честнее заполняешь пробег — тем
              точнее цифры. 😉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}