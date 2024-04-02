import { useState, useEffect } from "preact/hooks";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

import { CodeFrame } from "./frame";
/*
 * A more featured code embed component that uses CodeMirror
 *
 * Props: {
 *   initialValue?: string;
 *   editable: boolean;
 *   previewable: boolean;
 * }
 */
export const CodeEmbed = (props) => {
  const [rendered, setRendered] = useState(false);
  const initialCode = props.initialValue ?? "";
  // Source code from Google Docs sometimes uses a unicode non-breaking space
  // instead of a normal one, but these break the code frame, so we replace them here.
  // We also replace them in CodeFrame, but replacing here too ensures people don't
  // accidentally copy-and-paste them out of the embedded editor.
  const [codeString, setCodeString] = useState(initialCode.replace(/\u00A0/g, ' '));
  const [previewCodeString, setPreviewCodeString] = useState(codeString);

  useEffect(() => {
    setRendered(true);
  }, []);

  if (!rendered) return <div className="code-placeholder" />;

  return (
    <div className="mb-md flex w-full flex-col overflow-hidden md:flex-row">
      {props.previewable ? (
        <div>
          <CodeFrame jsCode={previewCodeString} width={150} height={200} />
          {/* TODO: Actual button styles */}
          <button
            className="bg-bg-gray-40 rounded-full p-xs"
            onClick={() => {
              console.log("updating code");
              setPreviewCodeString(codeString);
            }}
          >
            Run
          </button>
          <button
            className="bg-bg-gray-40 rounded-full p-xs"
            onClick={() => {
              console.log("resetting code");
              setCodeString(initialCode);
              setPreviewCodeString(initialCode);
            }}
          >
            Reset
          </button>
        </div>
      ) : null}
      <div className="w-full md:w-[calc(100%-150px)]">
        <CodeMirror
          value={codeString}
          theme="light"
          width="100%"
          minimalSetup={{
            highlightSpecialChars: false,
            history: true,
            drawSelection: true,
            syntaxHighlighting: true,
            defaultKeymap: true,
            historyKeymap: true,
          }}
          indentWithTab={false}
          extensions={[javascript()]}
          onChange={(val) => setCodeString(val)}
          editable={props.editable}
          onCreateEditor={(editorView) =>
            (editorView.contentDOM.ariaLabel = "Code Editor")
          }
        />
      </div>
    </div>
  );
};

export default CodeEmbed;
