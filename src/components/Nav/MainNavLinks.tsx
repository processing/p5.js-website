import styles from "./styles.module.scss";
import { Logo } from "../Logo";
import { Icon } from "../Icon";
import { useEffect, useState } from "preact/hooks";

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
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(!isMobile);

  const handleClick = () => {
    setOpen(!open);
  };

  // Defaults to closed on mobile, open on desktop
  // Have to do this in a lifecycle method
  // so that we can still server-side render
  useEffect(() => {
    const _isMobile = window.innerWidth < 768;
    setIsMobile(_isMobile);
    setOpen(!_isMobile);
  }, []);

  if (!links || links?.length <= 0) return null;

  const renderLogo = () => (
    <div class={styles.logo}>
      <a
        href="/"
        class={`${isHomepage ? "text-logo-color" : "text-sidebar-type-color"}`}
      >
        <Logo />
      </a>
      <button class={styles.toggle} onClick={handleClick}>
        <Icon kind={open ? "chevron-up" : "chevron-down"} />
      </button>
    </div>
  );

  return (
    <div class={`${styles.mainlinks} ${open && "open"}`} aria-expanded={open}>
      {renderLogo()}
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.url}>{link.label}</a>
          </li>
        ))}
      </ul>
      {
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
      }
    </div>
  );
};
