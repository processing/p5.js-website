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
  mobileMenuLabel: string;
  isHomepage: boolean;
  hasJumpTo: boolean;
};

export const MainNavLinks = ({
  links,
  donateButtonLabel,
  editorButtonLabel,
  mobileMenuLabel,
  isHomepage = false,
  hasJumpTo,
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
        class={`${
          isHomepage
            ? "text-logo-color hover:text-sidebar-type-color"
            : "text-sidebar-type-color hover:text-logo-color"
        }`}
        aria-label={isHomepage ? "Reload current page" : "Go to p5.js homepage"}
      >
        <Logo />
      </a>

      <button
        class={styles.toggle}
        onClick={handleClick}
        aria-hidden="true"
        tabIndex={-1}
      >
        <div class={styles.mobileMenuLabel}>
          {open ? (
            <Icon kind="close" />
          ) : (
            <>
              <span>{mobileMenuLabel}</span>
              <Icon kind="hamburger" />
            </>
          )}
        </div>
        <span class={styles.desktopMenuLabel}>
          <Icon kind={open ? "chevron-up" : "chevron-down"} />
        </span>
      </button>
    </div>
  );

  return (
    <div
      class={`${styles.mainlinks} ${open && "open"} ${
        !hasJumpTo && "noJumpTo"
      }`}
    >
      {renderLogo()}
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.url}>{link.label}</a>
          </li>
        ))}
      </ul>
      {
        <ul class="flex flex-col gap-[15px]">
          <li>
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
