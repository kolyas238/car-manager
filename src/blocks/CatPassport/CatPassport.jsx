import { formatAge } from '../../utils/format';
import './CatPassport.scss';

export default function CatPassport({ cat, innerRef }) {
  const photos = cat.photos || [];
  const profilePhoto = photos.find((photo) => photo.id === cat.profilePhotoId);

  return (
    <div className="cat-passport cat-passport--offscreen" ref={innerRef}>
      <header className="cat-passport__header">
        <span className="cat-passport__logo">🐾</span>
        <div>
          <h1 className="cat-passport__title">{cat.name}</h1>
          <p className="cat-passport__subtitle">
            Паспорт котика · Менеджер котиков
          </p>
        </div>
      </header>

      <div className="cat-passport__body">
        <div className="cat-passport__photo">
          {profilePhoto ? (
            <img src={profilePhoto.dataUrl} alt={cat.name} />
          ) : (
            <span>😺</span>
          )}
        </div>

        <table className="cat-passport__table">
          <tbody>
            <tr>
              <th>Порода</th>
              <td>{cat.breed || '—'}</td>
            </tr>
            <tr>
              <th>Возраст</th>
              <td>{formatAge(cat.age)}</td>
            </tr>
            <tr>
              <th>Вес</th>
              <td>{cat.weight} кг</td>
            </tr>
            <tr>
              <th>Цвет</th>
              <td>{cat.color || '—'}</td>
            </tr>
            <tr>
              <th>Характер</th>
              <td>{cat.character || '—'}</td>
            </tr>
            <tr>
              <th>Фото в галерее</th>
              <td>{photos.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="cat-passport__notes">
        <p className="cat-passport__notes-title">🐾 Для заметок</p>
        <div className="cat-passport__notes-line" />
        <div className="cat-passport__notes-line" />
        <div className="cat-passport__notes-line" />
        <div className="cat-passport__notes-line" />
      </div>

      <footer className="cat-passport__footer">
        <p className="cat-passport__date">
          Сформировано {new Date().toLocaleDateString('ru-RU')}
          <br />
          Сделано с ❤️ для котиков
        </p>

        <div className="cat-passport__stamp">
          <span className="cat-passport__stamp-paw">🐾</span>
          <span className="cat-passport__stamp-text">
            Место для отпечатка лапки настоящего кота
          </span>
        </div>
      </footer>
    </div>
  );
}