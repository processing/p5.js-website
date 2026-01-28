import { useState, useEffect, useRef } from "preact/hooks";
import { useLiveRegion } from "../hooks/useLiveRegion";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import { Prec, EditorState } from "@codemirror/state";
import { insertTab } from "@codemirror/commands";
import { cdnLibraryUrl, cdnSoundUrl } from "@/src/globals/globals";

import { CodeFrame } from "./frame";
import { CopyCodeButton } from "../CopyCodeButton";
import CircleButton from "../CircleButton";
import { Icon } from "../Icon";

/*
 * A more featured code embed component that uses CodeMirror
 */
export const CodeEmbed = (props) => {
  const { ref: liveRegionRef, announce } = useLiveRegion();
  const [rendered, setRendered] = useState(false);
  const [enableTabIndent, setEnableTabIndent] = useState(false);

  const initialCode = props.initialValue ?? "";
  const [codeString, setCodeString] = useState(
    initialCode.replace(/\u00A0/g, " "),
  );

  let { previewWidth, previewHeight } = props;

  const canvasMatch =
    /createCanvas\(\s*(\d+),\s*(\d+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(
      initialCode,
    );

  if (canvasMatch) {
    previewWidth = previewWidth || parseFloat(canvasMatch[1]);
    previewHeight = previewHeight || parseFloat(canvasMatch[2]);
  }

  const largeSketch = previewWidth && previewWidth > 770 - 60;

  const domMatch =
    /create(Button|Select|P|Div|Input|ColorPicker)/.exec(initialCode);

  if (domMatch && previewHeight) {
    previewHeight += 100;
  }

  const codeFrameRef = useRef(null);
  const [previewCodeString, setPreviewCodeString] = useState(codeString);

  const updateOrReRun = () => {
    if (codeString === previewCodeString) {
      setPreviewCodeString("");
      requestAnimationFrame(() => setPreviewCodeString(codeString));
    } else {
      setPreviewCodeString(codeString);
    }
    announce("Sketch is running");
  };

  useEffect(() => {
    setRendered(true);

    if (!document.getElementById("p5ScriptTag")) {
      const p5ScriptElement = document.createElement("script");
      p5ScriptElement.id = "p5ScriptTag";
      p5ScriptElement.src = cdnLibraryUrl;
      document.head.appendChild(p5ScriptElement);
    }
  }, []);

  if (!rendered) return <div className="code-placeholder" />;

  const escToBlur = EditorView.domEventHandlers({
    keydown(event, view) {
      if (event.key === "Escape") {
        view.contentDOM.blur();
        return true;
      }
      return false;
    },
  });

  return (
    <div
      className={`my-md flex w-full flex-col gap-[20px] overflow-hidden ${
        props.allowSideBySide ? "lg:flex-row" : ""
      } ${props.fullWidth ? "full-width" : ""}`}
    >
      {props.previewable ? (
        <div
          className={`ml-0 flex w-fit gap-[20px] ${
            largeSketch
              ? "flex-col"
              : props.allowSideBySide
              ? ""
              : "flex-col lg:flex-row"
          }`}
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
          <div
            className={`flex gap-2.5 ${
              largeSketch ? "flex-row" : "md:flex-row lg:flex-col"
            }`}
          >
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
                announce("Sketch stopped");
              }}
              ariaLabel="Stop sketch"
            >
              <Icon kind="stop" />
            </CircleButton>
          </div>
        </div>
      ) : null}

      {/* Tab indentation toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <input
          type="checkbox"
          checked={enableTabIndent}
          onChange={(e) => setEnableTabIndent(e.target.checked)}
        />
        <b>Enable tab indentation</b>
      </label>

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
          extensions={[
            javascript(),
            EditorView.lineWrapping,
            EditorState.tabSize.of(4),

            Prec.high(
              keymap.of([
                {
                  key: "Tab",
                  run: (view) => {
                    if (!enableTabIndent) {
                      view.contentDOM.blur();
                      return true;
                    }
                    return insertTab(view);
                  },
                },
              ]),
            ),

            escToBlur,
          ]}
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
              announce("Code reset to initial value.");
            }}
            ariaLabel="Reset code to initial value"
            className="bg-white text-black"
          >
            <Icon kind="refresh" />
          </CircleButton>
        </div>
      </div>

      <span ref={liveRegionRef} aria-live="polite" class="sr-only" />
    </div>
  );
};

export default CodeEmbed;
