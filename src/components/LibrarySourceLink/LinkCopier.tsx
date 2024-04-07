import { useState } from "preact/hooks"

export const LinkCopier = (props: { link: string; children: any }) => {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    navigator.clipboard.writeText(
      `<script src="${props.link}"></script>`
    );
    setCopied(true);
  }

  return (
    <>
      <a onClick={onClick} style={{ cursor: 'pointer' }}>
        {props.children}
      </a>
      {copied && <span style="opacity: 0.6; margin-left: 5px">Copied ✔️</span>}
    </>
  )
}
