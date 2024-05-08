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
  toggleCallback: () => void;
  isOpen: boolean;
};

export const MainNavLinks = ({
  links,
  donateButtonLabel,
  editorButtonLabel,
  mobileMenuLabel,
  isHomepage = false,
  toggleCallback,
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
        onClick={toggleCallback}
        aria-hidden="true"
        tabIndex={-1}
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
