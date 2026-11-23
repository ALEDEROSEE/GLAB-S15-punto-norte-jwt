import { useState } from 'react';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">PN</span>
      <span>Punto Norte</span>
    </div>
  );
}

export function Login({ onSignIn, notice }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setPending(true);

    try {
      await onSignIn({
        username: form.get('username').trim(),
        password: form.get('password'),
      });
    } catch (failure) {
      setError(failure.status === 401
        ? 'Usuario o contraseña incorrectos.'
        : 'No se pudo iniciar sesión. Comprueba la conexión con el servidor e inténtalo de nuevo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <aside className="login-aside">
        <Brand />
        <div className="aside-copy">
          <p className="eyebrow">Mi cuenta</p>
          <h2>Tus pedidos,<br /> en un solo lugar.</h2>
          <p>Consulta el estado y el historial de tus compras en Punto Norte.</p>
        </div>
      </aside>

      <section className="login-section" aria-labelledby="login-title">
        <div className="login-card">
          <h1 id="login-title">Inicia sesión</h1>
          <p className="intro">Ingresa tus credenciales para abrir tu cuenta.</p>
          {notice && <p className="notice" role="status">{notice}</p>}
          <form onSubmit={handleSubmit} aria-busy={pending}>
            <div className="field">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  aria-controls="password"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {error && <p className="error" role="alert">{error}</p>}

            <button className="primary-button" type="submit" disabled={pending}>
              {pending ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
