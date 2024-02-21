const wrapJsInMarkup = (jsCode) => `<!DOCTYPE html>
<meta charset="utf8" />
<body></body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.8.0/p5.min.js"></script>
<script id="code" type="module">${jsCode}</script>
`;

/*
 * Component that uses an iframe to run p5 code.
 * props: { code: string }
 */
export const CodeFrame = (props) => (
  <iframe
    srcDoc={wrapJsInMarkup(props.code)}
    sandbox="allow-scripts allow-popups allow-modals allow-forms"
    aria-label="Code Preview"
    title="Code Preview"
  />
);
