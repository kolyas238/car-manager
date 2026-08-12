import { useRef, useState } from 'react';
import Hero from '../../blocks/Hero/Hero';
import VehicleForm from '../../blocks/VehicleForm/VehicleForm';
import VehicleCatalog from '../../blocks/VehicleCatalog/VehicleCatalog';
import VehicleDetails from '../../blocks/VehicleDetails/VehicleDetails';
import BackupControls from '../../blocks/BackupControls/BackupControls';
import SyncStatus from '../../blocks/SyncStatus/SyncStatus';
import AuthModal from '../../blocks/AuthModal/AuthModal';
import ThemeToggle from '../../blocks/ThemeToggle/ThemeToggle';
import { useVehicles } from '../../hooks/useVehicles';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useClosing } from '../../hooks/useClosing';
import './Home.scss';

export default function Home() {
  const { user, authReady, linkEmail, signInEmail, resetPassword, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    vehicles,
    syncStatus,
    addVehicle,
    updateVehicle,
    removeVehicle,
    importVehicles,
    addService,
    deleteService,
    addFuel,
    deleteFuel,
  } = useVehicles(user, authReady);

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const formRef = useRef(null);

  const { mounted: formMounted, closing: formClosing } =
    useClosing(formOpen, 500);

  const detailsVehicle =
    vehicles.find((v) => v.id === detailsId) || null;

  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormOpen(true);
    scrollToForm();
  };

  return (
    <div className="home">
      <header className="home__header header">
        <span className="header__logo">🚗</span>
        <h1 className="header__title">Менеджер автомобилей</h1>
        <SyncStatus status={syncStatus} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <button
          className="home__auth-btn"
          type="button"
          onClick={() => setAuthOpen(true)}
        >
          {user && !user.isAnonymous ? `👤 ${user.email}` : '👤 Гость'}
        </button>
      </header>

      <main className="home__content">
        <Hero />

        <div
          ref={formRef}
          className={formClosing ? 'home__form home__form--closing' : 'home__form'}
        >
          {formMounted ? (
            <VehicleForm
              onAdd={addVehicle}
              onUpdate={updateVehicle}
              editingVehicle={editingVehicle}
              onCancelEdit={() => setEditingVehicle(null)}
              onCollapse={() => {
                setFormOpen(false);
                setEditingVehicle(null);
              }}
            />
          ) : (
            <button
              className="home__open-form"
              type="button"
              onClick={() => setFormOpen(true)}
            >
              ➕ Добавить автомобиль
            </button>
          )}
        </div>

        <VehicleCatalog
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={removeVehicle}
          onOpenDetails={(vehicle) => setDetailsId(vehicle.id)}
        />

        <BackupControls cats={vehicles} onImport={importVehicles} />
      </main>

      <footer className="home__footer">Сделано с ❤️ для автовладельцев</footer>

      {detailsVehicle && (
        <VehicleDetails
          vehicle={detailsVehicle}
          onClose={() => setDetailsId(null)}
          onAddService={addService}
          onDeleteService={deleteService}
          onAddFuel={addFuel}
          onDeleteFuel={deleteFuel}
        />
      )}

      {authOpen && (
        <AuthModal
          user={user}
          onClose={() => setAuthOpen(false)}
          onLinkEmail={linkEmail}
          onSignInEmail={signInEmail}
          onResetPassword={resetPassword}
          onSignOut={() => {
            setAuthOpen(false);
            signOutUser();
          }}
        />
      )}
    </div>
  );
}