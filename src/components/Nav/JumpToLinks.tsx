import styles from "./styles.module.scss";
import { useEffect, useState } from "preact/hooks";
import { Icon } from "../Icon";
import type { JumpToLink } from "@/src/globals/state";

type JumpToLinksProps = {
  links?: JumpToLink[];
  heading: string;
};

export const JumpToLinks = ({ links, heading }: JumpToLinksProps) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  // Defaults to closed on mobile, open on desktop
  // Have to do this in a lifecycle method
  // so that we can still server-side render
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    setOpen(!isMobile);
  }, []);

  if (!links || links?.length <= 0) return null;

  return (
    <div class={`${styles.jumpto} ${open && "open"}`} aria-expanded={open}>
      <button class={styles.toggle} onClick={handleClick}>
        <span>{heading}</span>
        <div class="pt-xs">
          <Icon kind={open ? "chevron-up" : "chevron-down"} />
        </div>
      </button>
      {open && (
        <ul>
          {links?.map((link) => (
            <li
              key={link.label}
              class={`
              ${link.size === "small" ? "text-body-caption" : "text-body capitalize"}
                ${link.current ? "underline" : ""}
                `}
            >
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
