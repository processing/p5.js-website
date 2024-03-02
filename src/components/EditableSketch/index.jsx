import CodeEmbedCodeMirror from "../CodeEmbed";

export const EditableSketch = (props) => (
  <CodeEmbedCodeMirror initialValue={props.code.trim()} previewable editable />
);
