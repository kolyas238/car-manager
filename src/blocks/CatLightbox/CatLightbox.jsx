import { useEffect, useRef, useState } from 'react';
import './CatLightbox.scss';

export default function CatLightbox({ photos, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touchX = useRef(null);

  const showPrev = () =>
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  const showNext = () =>
    setIndex((i) => (i + 1) % photos.length);

  // клик по фону/крестику закрывает ТОЛЬКО лайтбокс, не галерею
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
    <div className="cat-lightbox" onClick={close}>
      <button
        className="cat-lightbox__close"
        type="button"
        title="Закрыть (Esc)"
        onClick={close}
      >
        ✕
      </button>

      <div className="cat-lightbox__counter">
        {index + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            className="cat-lightbox__nav cat-lightbox__nav--prev"
            type="button"
            title="Предыдущее (←)"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
          >
            ←
          </button>
          <button
            className="cat-lightbox__nav cat-lightbox__nav--next"
            type="button"
            title="Следующее (→)"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
          >
            →
          </button>
        </>
      )}

      <figure
        className="cat-lightbox__figure"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const dx = event.changedTouches[0].clientX - touchX.current;
          if (dx > 50) showPrev();
          if (dx < -50) showNext();
          touchX.current = null;
        }}
      >
        <img
          className="cat-lightbox__img"
          src={photo.dataUrl}
          alt={`Фото ${index + 1}`}
        />
      </figure>
    </div>
  );
}