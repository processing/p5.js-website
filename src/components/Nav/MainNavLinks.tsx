import styles from "./styles.module.scss";
import { Logo } from "../Logo";
import { Icon } from "../Icon";
import { useRef, useState } from "preact/hooks";

type MainNavLinksProps = {
  links: {
    label: string;
    url: string;
  }[];
  editorButtonLabel: string;
  donateButtonLabel: string;
  isHomepage: boolean;
};

export const MainNavLinks = ({
  links,
  donateButtonLabel,
  editorButtonLabel,
  isHomepage = false,
}: MainNavLinksProps) => {
  const [open, setOpen] = useState(true);

  const mainLinksContainer = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setOpen(!open);
    mainLinksContainer.current?.classList.toggle("open");
  };

  if (!links || links?.length <= 0) return null;

  return (
    <div
      class={`${styles.mainlinks} open`}
      ref={mainLinksContainer}
      aria-expanded={open}
    >
      <ul>
        <li class={styles.logo}>
          <a
            href="/"
            class={`${isHomepage ? "text-logo-color" : "text-sidebar-type-color"}`}
          >
            <Logo />
          </a>
          <button class={styles.toggle} onClick={handleClick}>
            <Icon kind={open ? "chevron-down" : "chevron-up"} />
          </button>
        </li>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.url}>{link.label}</a>
          </li>
        ))}
      </ul>
      <ul>
        <li class="mb-xs">
          <a className={styles.buttonlink} href="https://editor.p5js.org">
            <div class="mr-xxs">
              <Icon kind="code-brackets" />
            </div>
            {editorButtonLabel}
          </a>
        </li>
        <li>
          <a className={styles.buttonlink} href="/donate">
            <div class="mr-xxs">
              <Icon kind="heart" />
            </div>
            {donateButtonLabel}
          </a>
        </li>
      </ul>
    </div>
  );
};
