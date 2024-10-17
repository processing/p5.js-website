import { useRef, useLayoutEffect, useEffect } from "preact/hooks";
import { cdnLibraryUrl } from "@/src/globals/globals";

interface CodeBundle {
  css?: string;
  htmlBody?: string;
  js?: string;
  base?: string;
  scripts?: string[];
}

// Function to wrap the sketch code
const wrapSketch = (sketchCode?: string) => {
  if (sketchCode && !sketchCode.includes("setup")) {
    return `
      function setup() {
        createCanvas(100, 100);
        background(200);
        ${sketchCode}
      }`;
  }
  return sketchCode;
};

// Function to wrap code in HTML markup
const wrapInMarkup = (code: CodeBundle) => `
<!DOCTYPE html>
<meta charset="utf8" />
<base href="${code.base || "/assets/"}" />
<style type='text/css'>
html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
${code.css || ""}
</style>
${(code.scripts ? [cdnLibraryUrl, ...code.scripts] : []).map((src) => `<script type="text/javascript" src="${src}"></script>`).join('\n')}
<body>${code.htmlBody || ""}</body>
<script id="code" type="text/javascript">${wrapSketch(code.js) || ""}</script>
${(code.scripts?.length ?? 0) === 0 ? `
<script type="text/javascript">
  window.addEventListener("message", event => {
    const scriptExists = !!document.getElementById("p5ScriptTagInIframe");
    if (!scriptExists && event.data?.sender === '${cdnLibraryUrl}') {
      const p5ScriptElement = document.createElement('script');
      p5ScriptElement.id = "p5ScriptTagInIframe";
      p5ScriptElement.type = 'text/javascript';
      p5ScriptElement.textContent = event.data.message;
      document.head.appendChild(p5ScriptElement);
    }
  });
</script>
` : ''}
`.replace(/\u00A0/g, " ");

// Props interface for CodeFrame
export interface CodeFrameProps {
  jsCode: string;
  cssCode?: string;
  htmlBodyCode?: string;
  height?: number | string;
  width?: number | string;
  base?: string;
  lazyLoad?: boolean;
  scripts?: string[];
}

// CodeFrame component
export const CodeFrame = (props: CodeFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const p5ScriptTag = document.getElementById("p5ScriptTag") as HTMLScriptElement;

  // Handle visibility of the iframe
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const { IntersectionObserver } = window;
    if (!IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && iframeRef.current) {
            iframeRef.current.style.removeProperty("display");
          } else if (iframeRef.current) {
            iframeRef.current.style.display = "none";
          }
        });
      },
      { rootMargin: "20px" },
    );
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Fetch p5.js script and post message
  useEffect(() => {
    (async () => {
      if (!p5ScriptTag || !iframeRef.current) return;

      try {
        const p5ScriptText = await fetch(p5ScriptTag.src).then((res) => res.text());
        iframeRef.current?.contentWindow?.postMessage(
          {
            sender: cdnLibraryUrl,
            message: p5ScriptText,
          },
          "*",
        );
      } catch (e) {
        console.error(`Error loading ${p5ScriptTag.src}`);
      }
    })();
  }, [p5ScriptTag, props.jsCode]);

  return (
    <div
      ref={containerRef}
      style={{ width: props.width, height: props.height }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={wrapInMarkup({
          js: props.jsCode,
          css: props.cssCode,
          htmlBody: props.htmlBodyCode,
          base: props.base,
          scripts: props.scripts,
        })}
        sandbox="allow-scripts allow-popups allow-modals allow-forms allow-same-origin"
        aria-label="Code Preview"
        title="Code Preview"
        height={props.height}
        width={props.width}
        loading={props.lazyLoad ? "lazy" : "eager"}
      />
    </div>
  );
};
