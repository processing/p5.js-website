import { useState, useEffect, useRef } from "preact/hooks";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cdnLibraryUrl } from "@/src/globals/globals";

import { CodeFrame } from "./frame";
import { CopyCodeButton } from "../CopyCodeButton";
import CircleButton from "../CircleButton";
import { Icon } from "../Icon";
/*
 * A more featured code embed component that uses CodeMirror
 *
 * Props: {
 *   initialValue?: string;
 *   editable: boolean;
 *   previewable: boolean;
 *   previewHeight?: number;
 *   previewWidth?: number;
 *   base?: string;
 *   lazyLoad?: boolean;
 *   TODO: refactor this prop behavior
 *   allowSideBySide?: boolean
 *   fullWidth?: boolean
 * }
 */
export const CodeEmbed = (props) => {
  const [rendered, setRendered] = useState(false);
  const initialCode = props.initialValue ?? "";
  // Source code from Google Docs sometimes uses a unicode non-breaking space
  // instead of a normal one, but these break the code frame, so we replace them here.
  // We also replace them in CodeFrame, but replacing here too ensures people don't
  // accidentally copy-and-paste them out of the embedded editor.
  const [codeString, setCodeString] = useState(
    initialCode.replace(/\u00A0/g, " "),
  );

  const codeFrameRef = useRef(null);

  const updateOrReRun = () => {
    if (codeString === previewCodeString) {
      setPreviewCodeString("");
      requestAnimationFrame(() => setPreviewCodeString(codeString));
    } else {
      setPreviewCodeString(codeString);
    }
  };

  const [previewCodeString, setPreviewCodeString] = useState(codeString);

  useEffect(() => {
    setRendered(true);

    // Includes p5.min.js script to be used by `CodeFrame` iframe(s)
    const p5ScriptElement = document.createElement("script");
    p5ScriptElement.id = "p5ScriptTag";
    p5ScriptElement.src = cdnLibraryUrl;
    document.head.appendChild(p5ScriptElement);
  }, []);

  if (!rendered) return <div className="code-placeholder" />;

  return (
    <div
      className={`my-md flex w-full flex-col gap-md overflow-hidden ${props.allowSideBySide && "lg:flex-row"} ${props.fullWidth && "full-width"}`}
    >
      {props.previewable ? (
        <div
          className={`ml-0 flex w-fit gap-[20px] ${props.allowSideBySide ? "" : "flex-col lg:flex-row"}`}
        >
          <div>
            <CodeFrame
              jsCode={previewCodeString}
              width={props.previewWidth}
              height={props.previewHeight}
              base={props.base}
              frameRef={codeFrameRef}
              lazyLoad={props.lazyLoad}
            />
          </div>
          <div className="flex gap-2.5 md:flex-row lg:flex-col">
            <CircleButton
              className="bg-bg-gray-40"
              onClick={updateOrReRun}
              ariaLabel="Run sketch"
            >
              <Icon kind="play" />
            </CircleButton>
            <CircleButton
              className="bg-bg-gray-40"
              onClick={() => {
                setPreviewCodeString("");
              }}
              ariaLabel="Stop sketch"
            >
              <Icon kind="stop" />
            </CircleButton>
          </div>
        </div>
      ) : null}
      <div className="code-editor-container relative w-full">
        <CodeMirror
          value={codeString}
          theme="light"
          width="100%"
          minimalSetup={{
            highlightSpecialChars: false,
            history: false,
            drawSelection: true,
            syntaxHighlighting: true,
            defaultKeymap: true,
            historyKeymap: true,
          }}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            autocompletion: false,
          }}
          extensions={[javascript(), EditorView.lineWrapping]}
          onChange={(val) => setCodeString(val)}
          editable={props.editable}
          onCreateEditor={(editorView) =>
            (editorView.contentDOM.ariaLabel = "Code Editor")
          }
        />
        <div className="absolute right-0 top-0 flex flex-col gap-xs p-xs md:flex-row">
          <CopyCodeButton textToCopy={codeString || initialCode} />
          <CircleButton
            onClick={() => {
              setCodeString(initialCode);
              setPreviewCodeString(initialCode);
            }}
            ariaLabel="Reset code to initial value"
            className="bg-sidebar-bg-color"
          >
            <Icon kind="refresh" />
          </CircleButton>
        </div>
      </div>
    </div>
  );
};

export default CodeEmbed;
