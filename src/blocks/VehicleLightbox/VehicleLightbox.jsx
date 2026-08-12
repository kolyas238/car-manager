import { useEffect, useRef, useState } from 'react';
import './VehicleLightbox.scss';

export default function VehicleLightbox({ photos, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touchX = useRef(null);

  const showPrev = () =>
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  const showNext = () =>
    setIndex((i) => (i + 1) % photos.length);

  const close = (event) => {
    event.stopPropagation();
    onClose();
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') showPrev();
      if (event.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, photos.length]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="vehicle-lightbox" onClick={close}>
      <button className="vehicle-lightbox__close" type="button" title="Закрыть (Esc)" onClick={close}>
        ✕
      </button>

      <div className="vehicle-lightbox__counter">
        {index + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            className="vehicle-lightbox__nav vehicle-lightbox__nav--prev"
            type="button"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
          >
            ←
          </button>
          <button
            className="vehicle-lightbox__nav vehicle-lightbox__nav--next"
            type="button"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
          >
            →
          </button>
        </>
      )}

      <figure
        className="vehicle-lightbox__figure"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx > 50) showPrev();
          if (dx < -50) showNext();
          touchX.current = null;
        }}
      >
        <img className="vehicle-lightbox__img" src={photo.dataUrl} alt={`Фото ${index + 1}`} />
      </figure>
    </div>
  );
}