import { CodeFrame } from "../CodeEmbed/frame";

/*
 * A component that displays a full-width sketch without showing its code.
 * props: {
 *   code: string;
 *   cssCode?: string;
 *   bodyCode?: string;
 *   width?: number | string;
 *   height?: number | string;
 * }
 */
export const SketchEmbed = (props) => (
  <CodeFrame
    code={props.code}
    cssCode={props.cssCode}
    bodyCode={props.bodyCode}
    height={props.height || 400}
    width={props.width || "100%"}
  />
);
