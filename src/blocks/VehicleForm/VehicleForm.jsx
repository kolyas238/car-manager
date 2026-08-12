import { useEffect, useState } from 'react';
import './VehicleForm.scss';

const EMPTY = {
  make: '',
  model: '',
  year: '',
  plate: '',
  vin: '',
  mileage: '',
  color: '',
  engine: '',
  transmission: 'МКПП',
  notes: '',
};

export default function VehicleForm({
  onAdd,
  onUpdate,
  editingVehicle,
  onCancelEdit,
  onCollapse,
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingVehicle) {
      const { id, services, fuel, createdAt, updatedAt, ...data } = editingVehicle;
      setForm({ ...EMPTY, ...data });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editingVehicle]);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      setError('Марка и модель обязательны.');
      return;
    }
    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year) || null,
      plate: form.plate.trim(),
      vin: form.vin.trim().toUpperCase(),
      mileage: Number(form.mileage) || 0,
      color: form.color.trim(),
      engine: form.engine.trim(),
      transmission: form.transmission,
      notes: form.notes.trim(),
    };

    if (editingVehicle) {
      onUpdate(editingVehicle.id, payload);
    } else {
      onAdd(payload);
      setForm(EMPTY);
    }
  };

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <header className="vehicle-form__header">
        <h2 className="vehicle-form__title">
          {editingVehicle
            ? `✏️ Редактирую: ${editingVehicle.make} ${editingVehicle.model}`
            : '🚗 Добавить автомобиль'}
        </h2>
        <button
          className="vehicle-form__collapse"
          type="button"
          onClick={onCollapse}
        >
          ⤵ Свернуть
        </button>
      </header>

      <div className="vehicle-form__grid">
        <label>
          Марка *
          <input value={form.make} onChange={set('make')} placeholder="Toyota" required />
        </label>
        <label>
          Модель *
          <input value={form.model} onChange={set('model')} placeholder="Camry" required />
        </label>
        <label>
          Год
          <input type="number" min="1950" max="2026" value={form.year} onChange={set('year')} />
        </label>
        <label>
          Госномер
          <input value={form.plate} onChange={set('plate')} placeholder="А123ВС777" />
        </label>
        <label>
          Пробег, км
          <input type="number" min="0" value={form.mileage} onChange={set('mileage')} />
        </label>
        <label>
          Цвет
          <input value={form.color} onChange={set('color')} placeholder="белый" />
        </label>
        <label>
          Двигатель
          <input value={form.engine} onChange={set('engine')} placeholder="2.5 бензин" />
        </label>
        <label>
          КПП
          <select value={form.transmission} onChange={set('transmission')}>
            <option>МКПП</option>
            <option>АКПП</option>
            <option>Робот</option>
            <option>Вариатор</option>
          </select>
        </label>
        <label className="vehicle-form__wide">
          VIN
          <input value={form.vin} onChange={set('vin')} maxLength={17} placeholder="17 символов" />
        </label>
        <label className="vehicle-form__wide">
          Заметка
          <textarea value={form.notes} onChange={set('notes')} rows={2} />
        </label>
      </div>

      {error && <p className="vehicle-form__error">{error}</p>}

      <div className="vehicle-form__actions">
        <button className="vehicle-form__submit" type="submit">
          {editingVehicle ? '💾 Сохранить' : '➕ Добавить'}
        </button>
        {editingVehicle && (
          <button
            className="vehicle-form__cancel"
            type="button"
            onClick={onCancelEdit}
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}