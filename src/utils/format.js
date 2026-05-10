export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
