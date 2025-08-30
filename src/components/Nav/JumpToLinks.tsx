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
    <div className={`${styles.jumpto} ${isOpen ? styles.open : ""}`}>
      <button
        className={styles.toggle}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={`${heading} menu toggle`}
      >
        <span>{heading}</span>
        <div className="pt-[6px]">
          <Icon kind={isOpen ? "chevron-down" : "chevron-up"} />
        </div>
      </button>
// ✅ Active link underline bug fixed on 30-Aug-2025
      {isOpen && (
        <ul>
          {links?.map((link) => (
            <li
              key={link.label}
              className={`${styles.linklabel} ${link.size ?? ""}`}
            >
              <a
                href={link.url}
                className={`${link.current ? "current" : ""}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
