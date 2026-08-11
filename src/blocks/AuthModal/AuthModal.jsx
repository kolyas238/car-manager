import { useState } from 'react';
import './AuthModal.scss';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Эта почта уже привязана к аккаунту — нажми «Войти в существующий».',
  'auth/credential-already-in-use': 'Эта почта уже привязана к аккаунту — нажми «Войти в существующий».',
  'auth/invalid-email': 'Похоже, в почте ошибка.',
  'auth/missing-email': 'Сначала введи почту — на неё придёт письмо.',
  'auth/user-not-found': 'Аккаунт с такой почтой не найден.',
  'auth/weak-password': 'Пароль должен быть не короче 6 символов.',
  'auth/invalid-credential': 'Неверная почта или пароль.',
  'auth/wrong-password': 'Неверная почта или пароль.',
  'auth/too-many-requests': 'Слишком много попыток — подожди немного.',
};

export default function AuthModal({
  user,
  onClose,
  onLinkEmail,
  onSignInEmail,
  onResetPassword,
  onSignOut,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const isAnonymous = !user || user.isAnonymous;

  const run = async (action) => {
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await action(email.trim(), password);
      onClose();
    } catch (e) {
      setError(ERROR_MESSAGES[e?.code] || 'Что-то пошло не так — попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    const mail = email.trim();
    if (!mail) {
      setError(ERROR_MESSAGES['auth/missing-email']);
      return;
    }
    setBusy(true);
    try {
      await onResetPassword(mail);
      setInfo(`Письмо для восстановления отправлено на ${mail} 📬`);
    } catch (e) {
      setError(ERROR_MESSAGES[e?.code] || 'Не удалось отправить письмо — попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-modal" onClick={onClose}>
      <div
        className="auth-modal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="auth-modal__header">
          <h3 className="auth-modal__title">👤 Аккаунт</h3>
          <button
            className="auth-modal__close"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {isAnonymous ? (
          <>
            <p className="auth-modal__text">
              Сейчас ты в гостевом режиме: котики хранятся в этом браузере
              и в облаке под временным id. Привяжи почту — и сможешь войти
              со своими котиками на любом устройстве.
            </p>

            <form
              className="auth-modal__form"
              onSubmit={(event) => {
                event.preventDefault();
                run(onLinkEmail);
              }}
            >
              <input
                className="auth-modal__input"
                type="email"
                placeholder="Почта"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                className="auth-modal__input"
                type="password"
                placeholder="Пароль (минимум 6 символов)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              {error && <p className="auth-modal__error">{error}</p>}
              {info && <p className="auth-modal__info">{info}</p>}

              <div className="auth-modal__actions">
                <button
                  className="auth-modal__submit"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? '⏳ …' : 'Создать аккаунт и привязать'}
                </button>
                <button
                  className="auth-modal__secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => run(onSignInEmail)}
                >
                  Войти в существующий
                </button>
              </div>

              <button
                className="auth-modal__forgot"
                type="button"
                disabled={busy}
                onClick={handleReset}
              >
                Забыли пароль?
              </button>
            </form>
          </>
        ) : (
          <div className="auth-modal__logged">
            <p className="auth-modal__text">
              Ты вошли как <b>{user.email}</b>.
              <br />
              Котики синхронизируются между устройствами ☁️
            </p>
            <button
              className="auth-modal__secondary"
              type="button"
              onClick={onSignOut}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
}