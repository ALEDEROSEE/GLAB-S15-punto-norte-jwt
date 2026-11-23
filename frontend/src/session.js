import { getPrivateAccount, refreshTokens } from './api.js';

const STORAGE_KEY = 'punto-norte.tokens';

export function readTokens() {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const tokens = JSON.parse(stored);
    if (typeof tokens?.access === 'string' && tokens.access &&
        typeof tokens?.refresh === 'string' && tokens.refresh) {
      return tokens;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  clearTokens();
  return null;
}

export function saveTokens({ access, refresh }) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ access, refresh }));
}

export function clearTokens() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function restoreAccount(tokens, signal) {
  try {
    return await getPrivateAccount(tokens.access, signal);
  } catch (error) {
    if (error.status !== 401) throw error;
  }

  const renewed = await refreshTokens(tokens.refresh, signal);
  signal.throwIfAborted();
  saveTokens(renewed);
  return getPrivateAccount(renewed.access, signal);
}
