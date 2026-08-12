import { useEffect, useState } from 'react';

// Держит компонент в DOM ещё `duration` мс после active=false,
// чтобы успела проиграться анимация закрытия
export function useClosing(active, duration = 500) {
  const [mounted, setMounted] = useState(active);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }
    if (!mounted) return undefined;

    setClosing(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [active, mounted, duration]);

  return { mounted, closing };
}