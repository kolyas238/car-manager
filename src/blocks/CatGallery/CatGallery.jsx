import { useEffect, useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../../utils/image';
import './CatGallery.scss';

export default function CatGallery({
  cat,
  onClose,
  onAddPhoto,
  onDeletePhoto,
  onAddComment,
  onSetProfile,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});

  const photos = cat.photos || [];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = ''; // чтобы можно было выбрать тот же файл снова

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
    <div className="cat-gallery" onClick={onClose}>
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
            {photos.map((photo) => (
              <figure key={photo.id} className="cat-gallery__item">
                <img
                  className="cat-gallery__img"
                  src={photo.dataUrl}
                  alt={cat.name}
                />

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
    </div>
  );
}