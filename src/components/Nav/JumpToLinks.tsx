import type { JumpToLink } from "@/src/globals/state";
import styles from "./styles.module.scss";
import { useEffect, useRef, useState } from "preact/hooks";
import { Icon } from "../Icon";
type JumpToLinksProps = {
  links?: JumpToLink[];
  heading: string;
};

export const JumpToLinks = ({ links, heading }: JumpToLinksProps) => {
  const [open, setOpen] = useState(true);

  const jumpToContainer = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setOpen(!open);
    document.documentElement.style.setProperty("--my-variable", "new-value");
    jumpToContainer.current?.classList.toggle("open");
  };

  if (!links || links?.length <= 0) return null;

  return (
    <div
      class={`${styles.jumpto} open`}
      ref={jumpToContainer}
      aria-expanded={open}
    >
      <button class={styles.toggle} onClick={handleClick}>
        <div class="flex justify-between px-md pt-md">
          <span>{heading}</span>
          <div class="pt-xs">
            <Icon kind={open ? "chevron-down" : "chevron-up"} />
          </div>
        </div>
      </button>
      {open && (
        <ul>
          {links?.map((link) => (
            <li key={link.label}>
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
