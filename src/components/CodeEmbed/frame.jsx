const wrapJsInMarkup = (jsCode, options) => `<!DOCTYPE html>
<meta charset="utf8" />
${options.cssCode ? (`<style type='text/css'>${options.cssCode}</style>`) : ""}
<body>${options.bodyCode || ""}</body>
<script id="code" type="text/javascript">${jsCode}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.1/p5.min.js"></script>
`;

/*
 * Component that uses an iframe to run p5 code.
 * props: { code: string; height?: number | string; width?: number | string }
 */
export const CodeFrame = (props) => (
  <iframe
    srcDoc={wrapJsInMarkup(props.code, props)}
    sandbox="allow-scripts allow-popups allow-modals allow-forms"
    aria-label="Code Preview"
    title="Code Preview"
    height={props.height}
    width={props.width}
  />
);
