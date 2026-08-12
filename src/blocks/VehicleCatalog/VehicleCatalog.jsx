import VehicleCard from '../VehicleCard/VehicleCard';
import './VehicleCatalog.scss';

export default function VehicleCatalog({
  vehicles,
  onEdit,
  onDelete,
  onOpenDetails,
}) {
  return (
    <section className="vehicle-catalog">
      <h2 className="vehicle-catalog__title">
        🚘 Гараж ({vehicles.length})
      </h2>

      {vehicles.length === 0 ? (
        <p className="vehicle-catalog__empty">
          Пока нет автомобилей — добавь первый сверху! 🚗
        </p>
      ) : (
        <div className="vehicle-catalog__grid">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
}