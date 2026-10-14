import styles from "./styles.module.scss";
import { Icon } from "../Icon";
import type { JumpToLink } from "@/src/globals/state";
import { useEffect, useRef, useState } from "preact/hooks";

type JumpToLinksProps = {
  links?: JumpToLink[];
  heading: string;
  handleToggle: () => void;
  isOpen: boolean;
};

const isJumpToShortcut = (event: KeyboardEvent): boolean => {
  if (!event.altKey) {
    return false;
  }

  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }

  const isJKey: boolean =
    event.code === "KeyJ" ||
    event.key === "j" ||
    event.key === "J" ||
    event.key === "∆";
  return isJKey;
};

const isEditableContext = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target instanceof HTMLElement && target.isContentEditable) {
    return true;
  }

  if (target.closest("input, textarea, select")) {
    return true;
  }

  if (target.closest(".cm-editor")) {
    return true;
  }
  return false;
};

export const JumpToLinks = ({
  links,
  heading,
  isOpen,
  handleToggle,
}: JumpToLinksProps) => {
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const [shortcutLabel, setShortcutLabel] = useState("Alt + J");

  useEffect(() => {
    if (navigator.platform.startsWith("Mac")) {
      setShortcutLabel("Option + J");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isJumpToShortcut(event) || isEditableContext(event.target)) {
        return;
      }

      if (!toggleButtonRef.current) {
        return;
      }

      event.preventDefault();
      toggleButtonRef.current.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!links || links?.length <= 0) return null;

  return (
    <div class={`${styles.jumpto} ${isOpen && "open"}`}>
      <button
        ref={toggleButtonRef}
        class={styles.toggle}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-keyshortcuts="Alt+J"
        aria-label={`${heading} menu toggle`}
      >
        <span>
          {heading}{" "}
          <kbd class="text-body-caption whitespace-nowrap">{shortcutLabel}</kbd>
        </span>
        <div class="pt-[6px]">
          <Icon kind={isOpen ? "chevron-down" : "chevron-up"} />
        </div>
      </button>

      {isOpen && (
        <ul>
          {links?.map((link) => (
            <li
              key={link.label}
              class={`${styles.linklabel} ${link.size ?? ""}`}
            >
              <a href={link.url} class={link.current ? "current" : ""}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
