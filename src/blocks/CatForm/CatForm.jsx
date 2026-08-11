import { useEffect, useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../../utils/image';
import './CatForm.scss';

const INITIAL_FORM = {
  name: '',
  age: '',
  color: '',
  breed: '',
  weight: '',
  character: '',
};

const FIELDS = [
  { name: 'name', label: 'Имя', type: 'text', placeholder: 'Барсик', required: true },
  { name: 'age', label: 'Возраст (лет)', type: 'number', placeholder: '3', min: 0, step: 1, required: true },
  { name: 'color', label: 'Цвет', type: 'text', placeholder: 'Рыжий' },
  { name: 'breed', label: 'Порода', type: 'text', placeholder: 'Мейн-кун' },
  { name: 'weight', label: 'Вес (кг)', type: 'number', placeholder: '4.5', min: 0, step: 0.1, required: true },
];

function catToForm(cat) {
  return {
    name: cat.name ?? '',
    age: String(cat.age ?? ''),
    color: cat.color ?? '',
    breed: cat.breed ?? '',
    weight: String(cat.weight ?? ''),
    character: cat.character ?? '',
  };
}

export default function CatForm({ onAdd, onUpdate, editingCat, onCancelEdit, onCollapse }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]); // превью фото (dataUrl) для режима добавления
  const fileRef = useRef(null);

  const isEditing = Boolean(editingCat);

  useEffect(() => {
    setErrors({});
    setForm(editingCat ? catToForm(editingCat) : INITIAL_FORM);
    if (!editingCat) setPhotos([]);
  }, [editingCat]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    const added = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      added.push(await fileToCompressedDataUrl(file));
    }
    setPhotos((prev) => [...prev, ...added]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Как зовут котика?';
    if (form.age === '' || Number(form.age) < 0) nextErrors.age = 'Укажите возраст (число ≥ 0)';
    if (form.weight === '' || Number(form.weight) <= 0) nextErrors.weight = 'Укажите вес (число > 0)';
    return nextErrors;
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setMessage('');
    setPhotos([]);
    onCancelEdit();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      age: Number(form.age),
      weight: Number(form.weight),
    };

    if (isEditing) {
      onUpdate(editingCat.id, payload);
      setMessage('Изменения сохранены! ✅');
      onCancelEdit();
    } else {
      onAdd(payload, photos);
      setMessage('Котик добавлен! 🎉');
      setForm(INITIAL_FORM);
      setPhotos([]);
    }

    window.setTimeout(() => setMessage(''), 3000);
  };

  return (
    <section className="cat-form">
      <div className="cat-form__head">
        <h2 className="cat-form__title">
          {isEditing ? 'Редактирование котика' : 'Добавить котика'}
        </h2>
        {onCollapse && (
          <button
            className="cat-form__collapse"
            type="button"
            onClick={onCollapse}
          >
            ✕ Свернуть
          </button>
        )}
      </div>

      {isEditing && (
        <div className="cat-form__editing">
          ✏️ Редактируем: <b>{editingCat.name}</b>
        </div>
      )}

      <form className="cat-form__form" onSubmit={handleSubmit} noValidate>
        <div className="cat-form__grid">
          {FIELDS.map((field) => (
            <label key={field.name} className="cat-form__field">
              <span className="cat-form__label">
                {field.label}
                {field.required && <span className="cat-form__required">*</span>}
              </span>
              <input
                className="cat-form__input"
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
                value={form[field.name]}
                onChange={handleChange}
              />
              {errors[field.name] && (
                <span className="cat-form__error">{errors[field.name]}</span>
              )}
            </label>
          ))}

          <label className="cat-form__field cat-form__field--wide">
            <span className="cat-form__label">Характер</span>
            <textarea
              className="cat-form__input cat-form__input--textarea"
              name="character"
              placeholder="Ласковый, любит спать на клавиатуре"
              rows={2}
              value={form.character}
              onChange={handleChange}
            />
          </label>
        </div>

        {!isEditing ? (
          <div className="cat-form__photos">
            <span className="cat-form__label">Фото</span>
            <div className="cat-form__photo-row">
              {photos.map((dataUrl, index) => (
                <div key={index} className="cat-form__photo-preview">
                  <img src={dataUrl} alt="Фото котика" />
                  <button
                    className="cat-form__photo-remove"
                    type="button"
                    onClick={() => removePhoto(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="cat-form__photo-add"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                📷 Добавить фото
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFiles}
            />
          </div>
        ) : (
          <p className="cat-form__hint">Фото добавляются в галерее карточки 📸</p>
        )}

        <div className="cat-form__actions">
          <button className="cat-form__submit" type="submit">
            {isEditing ? 'Сохранить изменения ✅' : 'Добавить котика 🐱'}
          </button>
          {isEditing && (
            <button
              className="cat-form__cancel"
              type="button"
              onClick={handleCancel}
            >
              Отмена
            </button>
          )}
        </div>

        {message && <p className="cat-form__success">{message}</p>}
      </form>
    </section>
  );
}