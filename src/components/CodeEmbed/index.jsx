import { useState } from "preact/hooks";
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
export const CodeEmbedCodeMirror = (props) => {
  const [codeString, setCodeString] = useState(props.initialValue ?? "");
  const [previewCodeString, setPreviewCodeString] = useState(codeString);

  return (
    <>
      <CodeMirror
        value={codeString}
        theme="light"
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
      {props.previewable ? (
        <>
          <button
            onClick={() => {
              console.log("updating code");
              setPreviewCodeString(codeString);
            }}
          >
            Run Code
          </button>
          <CodeFrame code={previewCodeString} />
        </>
      ) : null}
    </>
  );
};

export default CodeEmbedCodeMirror;
