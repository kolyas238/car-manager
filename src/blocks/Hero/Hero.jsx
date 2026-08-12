import './Hero.scss';

export default function Hero() {
  return (
    <section className="hero">
      <h2 className="hero__title">Ваши автомобили — под полным контролем</h2>
      <p className="hero__subtitle">
        История обслуживания и ремонтов, учёт топлива и трат, напоминания о ТО —
        всё в одном месте и на всех устройствах.
      </p>
      <div className="hero__features">
        <div className="hero__feature">🔧 Журнал ТО и ремонтов</div>
        <div className="hero__feature">⛽ Расход топлива и стоимость км</div>
        <div className="hero__feature">☁️ Синхронизация между устройствами</div>
      </div>
    </section>
  );
}