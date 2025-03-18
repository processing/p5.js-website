import { useRef, useLayoutEffect } from "preact/hooks";
import { cdnLibraryUrl } from "@/src/globals/globals";

interface CodeBundle {
  css?: string;
  htmlBody?: string;
  js?: string;
  base?: string;
}
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
<script src="${cdnLibraryUrl}"></script>
`.replace(/\u00A0/g, " ");

export const CodeFrameForServer = (props: CodeFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        })}
        sandbox="allow-scripts allow-popups allow-modals allow-forms"
        aria-label="Code Preview"
        title="Code Preview"
        height={props.height}
        width={props.width}
      />
    </div>
  );
};