import { p5VersionForEmbeds } from "@/src/globals/globals";

/*
 * Url to fetch the p5.js library from
 */
const p5LibraryUrl = `https://cdnjs.cloudflare.com/ajax/libs/p5.js/${p5VersionForEmbeds}/p5.min.js`;

interface CodeBundle {
  css?: string;
  htmlBody?: string;
  js?: string;
}

/*
 * Wraps the given code in a html document for display.
 * Single object argument, all properties optional:
 */
const wrapInMarkup = (code: CodeBundle) => `<!DOCTYPE html>
<meta charset="utf8" />
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
`.replace(/\u00A0/g, ' ');

export interface CodeFrameProps {
  jsCode: string;
  cssCode?: string;
  htmlBodyCode?: string;
  height?: number | string;
  width?: number | string;
}

/*
 * Component that uses an iframe to run code with the p5 library included.
 *
 */
export const CodeFrame = (props: CodeFrameProps) => (
  <iframe
    srcDoc={wrapInMarkup({
      js: props.jsCode,
      css: props.cssCode,
      htmlBody: props.htmlBodyCode,
    })}
    sandbox="allow-scripts allow-popups allow-modals allow-forms"
    aria-label="Code Preview"
    title="Code Preview"
    height={props.height}
    width={props.width}
  />
);
