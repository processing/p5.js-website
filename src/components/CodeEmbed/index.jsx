import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cdnLibraryUrl, cdnSoundUrl } from "@/src/globals/globals";

import { CodeFrame } from "./frame";
import { CopyCodeButton } from "../CopyCodeButton";
import CircleButton from "../CircleButton";
import { Icon } from "../Icon";

export const CodeEmbed = (props) => {
  const [rendered, setRendered] = useState(false);
  const initialCode = props.initialValue ?? "";
  
  const [codeString, setCodeString] = useState(
    initialCode.replace(/\u00A0/g, " "),
  );
  
  
  const [previewCodeString, setPreviewCodeString] = useState(codeString);

  let { previewWidth, previewHeight } = props;
  const canvasMatch = /createCanvas\(\s*(\d+),\s*(\d+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(initialCode);
  if (canvasMatch) {
    previewWidth = previewWidth || parseFloat(canvasMatch[1]);
    previewHeight = previewHeight || parseFloat(canvasMatch[2]);
  }

  const largeSketch = previewWidth && previewWidth > 770 - 60;

  const domMatch = /create(Button|Select|P|Div|Input|ColorPicker)/.exec(initialCode);
  if (domMatch && previewHeight) {
    previewHeight += 100;
  }

  const codeFrameRef = useRef(null);
  const p5ScriptRef = useRef(null);

  const [isRunning, setIsRunning] = useState(true);
  
  const updateOrReRun = useCallback(() => {
    try {
      setIsRunning(true);
      
      if (codeString === previewCodeString) {
        setPreviewCodeString("");
        setTimeout(() => {
          setPreviewCodeString(codeString);
        }, 50);
      } else {
        setPreviewCodeString(codeString);
      }
    } catch (error) {
      console.error("Error running sketch:", error);
      setIsRunning(false);
    }
  }, [codeString, previewCodeString]);

  useEffect(() => {
    setRendered(true);

    const p5ScriptElement = document.createElement("script");
    p5ScriptElement.id = "p5ScriptTag";
    p5ScriptElement.src = cdnLibraryUrl;
    document.head.appendChild(p5ScriptElement);
    p5ScriptRef.current = p5ScriptElement;

    return () => {
      if (p5ScriptRef.current && document.head.contains(p5ScriptRef.current)) {
        document.head.removeChild(p5ScriptRef.current);
      }
    };
  }, []);

  if (!rendered) return <div className="code-placeholder" aria-label="Loading code editor" />;

  return (
    <div
      className={`my-md flex w-full flex-col gap-[20px] overflow-hidden ${props.allowSideBySide ? "lg:flex-row" : ""} ${props.fullWidth ? "full-width" : ""}`}
    >
      {props.previewable ? (
        <div
          className={`ml-0 flex w-fit gap-[20px] ${largeSketch ? "flex-col" : (props.allowSideBySide ? "" : "flex-col lg:flex-row")}`}
        >
          <div>
            <CodeFrame
              jsCode={previewCodeString}
              width={previewWidth}
              height={previewHeight}
              base={props.base}
              frameRef={codeFrameRef}
              lazyLoad={props.lazyLoad}
              scripts={props.includeSound ? [cdnSoundUrl] : []}
            />
          </div>
          <div className={`flex gap-2.5 ${largeSketch ? "flex-row" : "md:flex-row lg:flex-col"}`}>
            <CircleButton
              className="bg-bg-gray-40"
              onClick={updateOrReRun}
              ariaLabel="Run sketch"
              disabled={!codeString.trim()}
            >
              <Icon kind={isRunning && codeString === previewCodeString ? "refresh" : "play"} />
            </CircleButton>
            <CircleButton
              className="bg-bg-gray-40"
              onClick={() => {
                setPreviewCodeString("");
                setIsRunning(false);
              }}
              ariaLabel="Stop sketch"
              disabled={!previewCodeString}
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
          indentWithTab={false}
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
            className="bg-white text-black"
          >
            <Icon kind="refresh" />
          </CircleButton>
        </div>
      </div>
    </div>
  );
};

export default CodeEmbed;