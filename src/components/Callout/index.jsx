/*
 * A component that points out something to the reader, such as a call to
 * try out an idea oneself.
 * props: { title?: string; children: any }
 */
export const Callout = (props) => (
  <div className={`callout ${props.title ? 'callout-note' : ''}`}>
    <h5 class="">{props.title || "Try this!"}</h5>
    {props.children}
  </div>
);
