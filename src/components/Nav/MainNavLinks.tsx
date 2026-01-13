import styles from "./styles.module.scss";
import { Logo } from "../Logo";
import { Icon } from "../Icon";

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
  handleToggle: () => void;
  isOpen: boolean;
};

export const MainNavLinks = ({
  links,
  donateButtonLabel,
  editorButtonLabel,
  mobileMenuLabel,
  isHomepage = false,
  handleToggle,
  isOpen,
  hasJumpTo,
}: MainNavLinksProps) => {
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
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="main-links-list main-cta-list"
        aria-label={mobileMenuLabel || "Toggle navigation menu"}
      >
        <div class={styles.mobileMenuLabel}>
          {isOpen ? (
            <Icon kind="close" />
          ) : (
            <>
              <span>{mobileMenuLabel}</span>
              <Icon kind="hamburger" />
            </>
          )}
        </div>
        <span class={styles.desktopMenuLabel}>
          <Icon kind={isOpen ? "chevron-up" : "chevron-down"} />
        </span>
      </button>
    </div>
  );

  return (
    <div
      class={`${styles.mainlinks} ${isOpen && "open"} ${
        !hasJumpTo && "noJumpTo"
      }`}
    >
      {renderLogo()}
      <ul id="main-links-list" hidden={!isOpen}>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.url}>{link.label}</a>
          </li>
        ))}
      </ul>
      <ul
        id="main-cta-list"
        class={`${isOpen ? "flex" : ""} flex-col gap-[15px]`}
        hidden={!isOpen}
      >
        <li>
          <a className={styles.buttonlink} href="https://editor.p5js.org">
            <div class="mr-xxs">
              <Icon kind="code-brackets" />
            </div>
            {editorButtonLabel}
          </a>
        </li>
        <li>
          <a className={styles.buttonlink} href="/donate/">
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
