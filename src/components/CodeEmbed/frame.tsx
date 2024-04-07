import { useRef, useLayoutEffect } from 'preact/hooks';
import { p5VersionForEmbeds } from "@/src/globals/globals";

/*
 * Url to fetch the p5.js library from
 */
const p5LibraryUrl = `https://cdnjs.cloudflare.com/ajax/libs/p5.js/${p5VersionForEmbeds}/p5.min.js`;

interface CodeBundle {
  css?: string;
  htmlBody?: string;
  js?: string;
  base?: string;
}

/*
 * Wraps the given code in a html document for display.
 * Single object argument, all properties optional:
 */
const wrapInMarkup = (code: CodeBundle) =>
  `<!DOCTYPE html>
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
<body>${code.htmlBody || ""}</body>
<script id="code" type="text/javascript">${code.js || ""}</script>
<script src="${p5LibraryUrl}"></script>
`.replace(/\u00A0/g, " ");

export interface CodeFrameProps {
  jsCode: string;
  cssCode?: string;
  htmlBodyCode?: string;
  height?: number | string;
  width?: number | string;
  base?: string;
}

/*
 * Component that uses an iframe to run code with the p5 library included.
 *
 */
export const CodeFrame = (props: CodeFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For performance, set the iframe to display:none when
  // not visible on the page. This will stop the browser
  // from running `draw` every frame, which helps performance
  // on pages with multiple sketches, and causes sketch
  // animations only to start when they become visible.
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const { IntersectionObserver } = window;
    if (!IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!iframeRef.current) return;
        if (entry.isIntersecting) {
          iframeRef.current.style.removeProperty('display');
        } else {
          iframeRef.current.style.display = 'none';
        }
      });
    }, { rootMargin: '20px' });
    observer.observe(containerRef.current)

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: props.width, height: props.height }}>
      <iframe
        ref={iframeRef}
        srcDoc={wrapInMarkup({
          js: props.jsCode,
          css: props.cssCode,
          htmlBody: props.htmlBodyCode,
          base: props.base,
        })}
        sandbox="allow-scripts allow-popups allow-modals allow-forms"
        aria-label="Code Preview"
        title="Code Preview"
        height={props.height}
        width={props.width}
      />
    </div>
  );
}
