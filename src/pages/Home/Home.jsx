import { useRef, useState } from 'react';
import Hero from '../../blocks/Hero/Hero';
import CatForm from '../../blocks/CatForm/CatForm';
import CatCatalog from '../../blocks/CatCatalog/CatCatalog';
import CatGallery from '../../blocks/CatGallery/CatGallery';
import BackupControls from '../../blocks/BackupControls/BackupControls';
import SyncStatus from '../../blocks/SyncStatus/SyncStatus';
import AuthModal from '../../blocks/AuthModal/AuthModal';
import ThemeToggle from '../../blocks/ThemeToggle/ThemeToggle';
import { useCats } from '../../hooks/useCats';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useClosing } from '../../hooks/useClosing';
import './Home.scss';

export default function Home() {
  const { user, authReady, linkEmail, signInEmail, resetPassword, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    cats,
    syncStatus,
    addCat,
    updateCat,
    removeCat,
    importCats,
    addPhoto,
    deletePhoto,
    addComment,
    setProfilePhoto,
  } = useCats(user, authReady);

  const [editingCat, setEditingCat] = useState(null);
  const [galleryCatId, setGalleryCatId] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const formRef = useRef(null);

  const { mounted: galleryMounted, closing: galleryClosing } =
    useClosing(galleryOpen, 500);
  const { mounted: formMounted, closing: formClosing } =
    useClosing(formOpen, 500);

  const galleryCat = cats.find((cat) => cat.id === galleryCatId) || null;

  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setFormOpen(true);
    scrollToForm();
  };

  const handleCollapse = () => {
    setFormOpen(false);
    setEditingCat(null);
  };

  return (
    <div className="home">
      <header className="home__header header">
        <span className="header__logo">🐾</span>
        <h1 className="header__title">Менеджер котиков</h1>
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
            <CatForm
              onAdd={addCat}
              onUpdate={updateCat}
              editingCat={editingCat}
              onCancelEdit={() => setEditingCat(null)}
              onCollapse={handleCollapse}
            />
          ) : (
            <button
              className="home__open-form"
              type="button"
              onClick={() => setFormOpen(true)}
            >
              ➕ Добавить котика
            </button>
          )}
        </div>

        <CatCatalog
          cats={cats}
          onEdit={handleEdit}
          onDelete={removeCat}
          onOpenGallery={(cat) => {
            setGalleryCatId(cat.id);
            setGalleryOpen(true);
          }}
        />

        <BackupControls cats={cats} onImport={importCats} />
      </main>

      <footer className="home__footer">Сделано с ❤️ для котиков</footer>

      {galleryMounted && galleryCat && (
        <CatGallery
          cat={galleryCat}
          closing={galleryClosing}
          onClose={() => setGalleryOpen(false)}
          onAddPhoto={addPhoto}
          onDeletePhoto={deletePhoto}
          onAddComment={addComment}
          onSetProfile={setProfilePhoto}
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