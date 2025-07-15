import { useRef } from 'preact/hooks';

export function useLiveRegion<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  const announce = (message: string, clearMessage = 1000) => {
    const node = ref.current;
    if (!node) return;
    node.textContent = message;
    setTimeout(() => {
      if (node) node.textContent = '';
    }, clearMessage);
  };

  return { ref, announce };
}
