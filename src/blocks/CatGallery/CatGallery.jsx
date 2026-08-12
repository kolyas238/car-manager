import { useEffect, useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../../utils/image';
import CatLightbox from '../CatLightbox/CatLightbox';
import './CatGallery.scss';

export default function CatGallery({
  cat,
  closing = false,
  onClose,
  onAddPhoto,
  onDeletePhoto,
  onAddComment,
  onSetProfile,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos = cat.photos || [];

  useEffect(() => {
    const handleKey = (event) => {
      // Esc закрывает лайтбокс первым, галерею — вторым
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
      const ok = onAddPhoto(cat.id, dataUrl);
      if (!ok) {
        setError('Не удалось сохранить фото — хранилище переполнено. Удали лишние фото. 😿');
      } else {
        setError('');
      }
    }
  };

  const submitComment = (photoId) => {
    const text = (commentDrafts[photoId] || '').trim();
    if (!text) return;
    onAddComment(cat.id, photoId, text);
    setCommentDrafts((prev) => ({ ...prev, [photoId]: '' }));
  };

  return (
    <div
      className={closing ? 'cat-gallery cat-gallery--closing' : 'cat-gallery'}
      onClick={onClose}
    >
      <div
        className="cat-gallery__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cat-gallery__header">
          <h3 className="cat-gallery__title">📸 Галерея: {cat.name}</h3>
          <button className="cat-gallery__close" type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <button
          className="cat-gallery__upload"
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

        {error && <p className="cat-gallery__error">{error}</p>}

        {photos.length === 0 ? (
          <p className="cat-gallery__empty">Пока нет фото — загрузи первое! 🐾</p>
        ) : (
          <div className="cat-gallery__grid">
            {photos.map((photo, index) => (
              <figure key={photo.id} className="cat-gallery__item">
                <button
                  className="cat-gallery__zoom"
                  type="button"
                  title="Открыть на весь экран"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    className="cat-gallery__img"
                    src={photo.dataUrl}
                    alt={cat.name}
                  />
                </button>

                {cat.profilePhotoId === photo.id && (
                  <span className="cat-gallery__badge">Фото профиля</span>
                )}

                <div className="cat-gallery__actions">
                  <button
                    type="button"
                    onClick={() => onSetProfile(cat.id, photo.id)}
                  >
                    ⭐ В профиль
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePhoto(cat.id, photo.id)}
                  >
                    🗑 Удалить
                  </button>
                </div>

                <figcaption className="cat-gallery__comments">
                  {(photo.comments || []).map((comment) => (
                    <p key={comment.id} className="cat-gallery__comment">
                      {comment.text}
                    </p>
                  ))}

                  <div className="cat-gallery__comment-form">
                    <input
                      placeholder="Комментарий…"
                      value={commentDrafts[photo.id] || ''}
                      onChange={(event) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [photo.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') submitComment(photo.id);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => submitComment(photo.id)}
                    >
                      ОК
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <CatLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}