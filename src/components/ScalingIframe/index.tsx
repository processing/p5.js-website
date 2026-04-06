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
  const [error, setError] = useState(false);

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

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#333",
          fontSize: "16px",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div>
          <p>Unable to load embedded content</p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>
            Please visit{" "}
            <a
              href={props.src?.replace("/embed", "")}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#d63384" }}
            >
              the original sketch
            </a>
            {" "}on OpenProcessing
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      width={width}
      {...props}
      sandbox="allow-scripts allow-popups allow-modals allow-forms allow-same-origin"
      allow="fullscreen; clipboard-write"
      loading="lazy"
      onError={handleError}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `scale(${scale.toFixed(4)})`,
        transformOrigin: "top left",
      }}
      ref={iframeRef}
    />
  );
};
