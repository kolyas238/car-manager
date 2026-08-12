import { useRef, useState } from 'react';
import { formatAge } from '../../utils/format';
import { exportCatToPdf } from '../../utils/pdf';
import CatPassport from '../CatPassport/CatPassport';
import './CatCard.scss';

export default function CatCard({ cat, onEdit, onDelete, onOpenGallery }) {
  const photos = cat.photos || [];
  const profilePhoto = photos.find((photo) => photo.id === cat.profilePhotoId);
  const passportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handlePdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportCatToPdf(cat, passportRef.current);
    } catch (error) {
      console.error('Не удалось создать PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  // сначала анимация исчезновения, потом реальное удаление
  const handleDelete = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onDelete(cat.id), 500);
  };

  return (
    <article
      className={leaving ? 'cat-card cat-card--leaving' : 'cat-card'}
    >
      <div className="cat-card__top">
        <div className="cat-card__avatar">
          {profilePhoto ? (
            <img
              className="cat-card__avatar-img"
              src={profilePhoto.dataUrl}
              alt={cat.name}
            />
          ) : (
            '😺'
          )}
        </div>
        <div className="cat-card__heading">
          <h3 className="cat-card__name">{cat.name}</h3>
          <p className="cat-card__breed">{cat.breed || 'Порода не указана'}</p>
        </div>
      </div>

      <dl className="cat-card__meta">
        <div className="cat-card__param">
          <dt className="cat-card__param-label">Возраст</dt>
          <dd className="cat-card__param-value">{formatAge(cat.age)}</dd>
        </div>
        <div className="cat-card__param">
          <dt className="cat-card__param-label">Вес</dt>
          <dd className="cat-card__param-value">{cat.weight} кг</dd>
        </div>
        <div className="cat-card__param">
          <dt className="cat-card__param-label">Цвет</dt>
          <dd className="cat-card__param-value">{cat.color || '—'}</dd>
        </div>
      </dl>

      {cat.character && (
        <p className="cat-card__character">«{cat.character}»</p>
      )}

      <button
        className="cat-card__gallery"
        type="button"
        onClick={() => onOpenGallery(cat)}
        disabled={leaving}
      >
        📸 Галерея ({photos.length})
      </button>

      <div className="cat-card__actions">
        <button
          className="cat-card__edit"
          type="button"
          onClick={() => onEdit(cat)}
          disabled={leaving}
        >
          Изменить
        </button>
        <button
          className="cat-card__pdf"
          type="button"
          disabled={exporting || leaving}
          onClick={handlePdf}
        >
          {exporting ? '⏳ PDF…' : '📄 PDF'}
        </button>
        <button
          className="cat-card__delete"
          type="button"
          disabled={leaving}
          onClick={handleDelete}
        >
          Удалить
        </button>
      </div>

      {/* скрытый «паспорт» для рендера в PDF */}
      <CatPassport cat={cat} innerRef={passportRef} />
    </article>
  );
}