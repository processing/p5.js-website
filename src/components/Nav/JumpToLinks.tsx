import styles from "./styles.module.scss";
import { Icon } from "../Icon";
import type { JumpToLink } from "@/src/globals/state";

type JumpToLinksProps = {
  links?: JumpToLink[];
  heading: string;
  handleToggle: () => void;
  isOpen: boolean;
};

export const JumpToLinks = ({
  links,
  heading,
  isOpen,
  handleToggle,
}: JumpToLinksProps) => {
  if (!links || links?.length <= 0) return null;

  return (
    <div class={`${styles.jumpto} ${isOpen && "open"}`}>
      <button
        class={styles.toggle}
        onClick={handleToggle}
        aria-hidden="true"
        tabIndex={-1}
      >
        <span>{heading}</span>
        <div class="pt-[6px]">
          <Icon kind={isOpen ? "chevron-down" : "chevron-up"} />
        </div>
      </button>
      {isOpen && (
        <ul>
          {links?.map((link) => (
            <li
              key={link.label}
              class={`${styles.linklabel} ${link.size ?? ""} ${link.current ? "current" : ""}`}
            >
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
