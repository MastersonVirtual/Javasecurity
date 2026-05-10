import React from 'react';

export function useClock() {
  const [clock, setClock] = React.useState(() => new Date().toLocaleTimeString('es-AR'));

  React.useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('es-AR')), 1000);
    return () => clearInterval(timer);
  }, []);

  return clock;
}
