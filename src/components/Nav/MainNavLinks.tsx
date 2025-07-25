import styles from "./styles.module.scss";
import { Logo } from "../Logo";
import { Icon } from "../Icon";
import { useEffect, useRef } from "preact/hooks";

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
  
  //Fix : Menu list automatically expands on Tab key navigation but is not visible
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e : KeyboardEvent) => {
      if (e.key === "Tab"){
        requestAnimationFrame(()=>{
          const active = document.activeElement;
          if (menuRef.current && buttonRef.current && !menuRef.current.contains(active as Node) && !buttonRef.current.contains(active as Node)) {

            if (isOpen){
              handleToggle();
            }
            
          }
        });
      }
    };

    document.addEventListener("keydown",handleKeyDown);
    

  
    return () => {
      document.removeEventListener("keydown",handleKeyDown)
    }
  }, [isOpen , handleToggle])
  



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
        ref={buttonRef}
        class={styles.toggle}
        onClick={handleToggle}
        aria-expanded={isOpen}
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
      ref={menuRef}
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
