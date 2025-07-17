import { useRef, useEffect } from 'preact/hooks';

export function useLiveRegion<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clear any existing timer */
  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (ref.current) ref.current.textContent = '';
  };

  const announce = (message: string, clearMessage = 1000) => {
    const node = ref.current;
    if (!node) return;
    clearTimer();
    node.textContent = message;
    timerRef.current = setTimeout(() => {
      if (node) node.textContent = '';
      timerRef.current = null;
    }, clearMessage);
  };

  useEffect(() => clearTimer, []);

  return { ref, announce };
}
