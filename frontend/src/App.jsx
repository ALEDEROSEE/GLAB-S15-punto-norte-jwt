import { useEffect, useState } from 'react';
import { getPrivateAccount, obtainTokens, revokeRefreshToken } from './api.js';
import { clearTokens, readTokens, restoreAccount, saveTokens } from './session.js';
import { Brand, Login } from './Login.jsx';
import { Store } from './Store.jsx';

function setPath(path) {
  if (window.location.pathname !== path) window.history.replaceState(null, '', path);
}

export default function App() {
  const [session, setSession] = useState({ status: 'checking' });
  const [validationAttempt, setValidationAttempt] = useState(0);

  useEffect(() => {
    function onPageShow(event) {
      if (event.persisted) {
        setSession({ status: 'checking' });
        setValidationAttempt((attempt) => attempt + 1);
      }
    }

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function validateSession() {
      try {
        const tokens = readTokens();
        if (!tokens) {
          const isPrivatePage = window.location.pathname === '/tienda';
          setPath('/login');
          setSession({
            status: 'anonymous',
            notice: isPrivatePage ? 'Inicia sesión para acceder a tus pedidos.' : '',
          });
          return;
        }

        const account = await restoreAccount(tokens, signal);
        if (signal.aborted) return;
        setPath('/tienda');
        setSession({ status: 'authenticated', account });
      } catch (error) {
        if (signal.aborted) return;

        if (error.status === 401) {
          clearTokens();
          setPath('/login');
          setSession({
            status: 'anonymous',
            notice: 'Tu sesión venció. Vuelve a iniciar sesión.',
          });
          return;
        }

        setSession({ status: 'unavailable' });
      }
    }

    void validateSession();
    return () => controller.abort();
  }, [validationAttempt]);

  async function signIn(credentials) {
    const tokens = await obtainTokens(credentials);
    const account = await getPrivateAccount(tokens.access);
    saveTokens(tokens);
    setPath('/tienda');
    setSession({ status: 'authenticated', account });
  }

  function signOut() {
    const tokens = readTokens();
    clearTokens();
    setPath('/login');
    const closed = { status: 'anonymous', notice: 'Cerraste sesión correctamente.' };
    setSession(closed);

    if (tokens) {
      void revokeRefreshToken(tokens.refresh).catch(() => {
        setSession((current) => current === closed ? {
          ...closed,
          notice: 'Se cerró la sesión en este navegador. No se pudo confirmar la revocación en el servidor.',
        } : current);
      });
    }
  }

  if (session.status === 'authenticated') {
    return <Store account={session.account} onSignOut={signOut} />;
  }

  if (session.status === 'anonymous') {
    return <Login onSignIn={signIn} notice={session.notice} />;
  }

  return (
    <main className="status-page">
      <section className="status-card" aria-live="polite">
        <Brand />
        {session.status === 'checking' ? (
          <p role="status">Comprobando tu sesión…</p>
        ) : (
          <>
            <h1>Tu cuenta no está disponible</h1>
            <p>No se pudo verificar la sesión. Comprueba que el servidor esté activo.</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setSession({ status: 'checking' });
                setValidationAttempt((attempt) => attempt + 1);
              }}
            >
              Volver a intentar
            </button>
          </>
        )}
      </section>
    </main>
  );
}
