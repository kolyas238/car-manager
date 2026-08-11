import './Hero.scss';

export default function Hero() {
  return (
    <section className="hero">
      <h2 className="hero__title">Все ваши котики — в одном месте</h2>
      <p className="hero__text">
        «Менеджер котиков» — уютное приложение для учёта пушистых членов семьи.
        Добавляйте котиков, указывайте породу, вес и характер — и вся коллекция
        всегда будет под рукой. Всё хранится локально, без интернета.
      </p>
      <ul className="hero__features">
        <li className="hero__feature">📝 Добавление котика за пару секунд</li>
        <li className="hero__feature">🗂 Удобные карточки с информацией</li>
        <li className="hero__feature">🔒 Данные хранятся локально</li>
      </ul>
    </section>
  );
}