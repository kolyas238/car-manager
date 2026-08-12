import { useEffect, useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../../utils/image';
import VehicleLightbox from '../VehicleLightbox/VehicleLightbox';
import './VehicleGallery.scss';

export default function VehicleGallery({
  vehicle,
  closing = false,
  onClose,
  onAddPhoto,
  onDeletePhoto,
  onSetCover,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos = vehicle.photos || [];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && lightboxIndex === null) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, lightboxIndex]);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await fileToCompressedDataUrl(file);
      const ok = onAddPhoto(vehicle.id, dataUrl);
      if (!ok) {
        setError('Не удалось сохранить фото — хранилище переполнено. Удали лишние фото.');
      } else {
        setError('');
      }
    }
  };

  return (
    <div
      className={closing ? 'vehicle-gallery vehicle-gallery--closing' : 'vehicle-gallery'}
      onClick={onClose}
    >
      <div className="vehicle-gallery__panel" onClick={(e) => e.stopPropagation()}>
        <header className="vehicle-gallery__header">
          <h3 className="vehicle-gallery__title">
            📸 Фото: {vehicle.make} {vehicle.model}
          </h3>
          <button className="vehicle-gallery__close" type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <button
          className="vehicle-gallery__upload"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Загрузить фото
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />

        {error && <p className="vehicle-gallery__error">{error}</p>}

        {photos.length === 0 ? (
          <p className="vehicle-gallery__empty">Пока нет фото — загрузи первое! 🚗</p>
        ) : (
          <div className="vehicle-gallery__grid">
            {photos.map((photo, index) => (
              <figure key={photo.id} className="vehicle-gallery__item">
                <button
                  className="vehicle-gallery__zoom"
                  type="button"
                  title="Открыть на весь экран"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    className="vehicle-gallery__img"
                    src={photo.dataUrl}
                    alt={vehicle.make}
                  />
                </button>

                {vehicle.coverPhotoId === photo.id && (
                  <span className="vehicle-gallery__badge">Обложка</span>
                )}

                <div className="vehicle-gallery__actions">
                  <button type="button" onClick={() => onSetCover(vehicle.id, photo.id)}>
                    ⭐ На обложку
                  </button>
                  <button type="button" onClick={() => onDeletePhoto(vehicle.id, photo.id)}>
                    🗑 Удалить
                  </button>
                </div>
              </figure>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <VehicleLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}