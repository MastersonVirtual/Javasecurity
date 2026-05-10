export const SESSION_KEY = 'sentinel-session';

export function loadSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
