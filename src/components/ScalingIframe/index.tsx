import { useLayoutEffect, useRef, useState } from "preact/hooks";

export const ScalingIframe = ({
  width,
  ...props
}: {
  width: number;
  [key: string]: any;
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fitToParent = () => {
      const iframe = iframeRef.current;
      // Two parents up to get out of the astro island
      const parent = iframe?.parentElement?.parentElement;
      if (!iframe || !parent) return;

      const parentWidth = parent.getBoundingClientRect().width;
      setScale(parentWidth / width);
    };
    fitToParent();
    window.addEventListener("resize", fitToParent);
    return () => window.removeEventListener("resize", fitToParent);
  }, [width]);

  return (
    <iframe
      width={width}
      {...props}
      style={{ transform: `scale(${scale.toFixed(4)})`, transformOrigin: 'top left' }}
      ref={iframeRef}
    />
  );
};
