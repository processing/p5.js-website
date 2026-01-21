import type { JumpToState } from "@/src/globals/state";
import { JumpToLinks } from "./JumpToLinks";
import { MainNavLinks } from "./MainNavLinks";
import { useEffect, useState } from "preact/hooks";

const BREAKPOINT = 768;

const getIsMobile = () => {
  if (typeof window === "undefined") return false; // assume desktop on SSR
  return window.innerWidth < BREAKPOINT;
};


interface NavPanelsProps {
  mainLinks: {
    label: string;
    url: string;
  }[];
  editorButtonLabel: string;
  donateButtonLabel: string;
  mobileMenuLabel: string;
  jumpToLabel: string;
  isHomepage: boolean;
  jumpToState: JumpToState | null;
}

/**
 * This component primarily exists to manage open/closed state between
 * the two link menus, which behaves differently on mobile than on desktop.
 *
 */
export const NavPanels = (props: NavPanelsProps) => {
  const {
    mainLinks,
    isHomepage,
    editorButtonLabel,
    donateButtonLabel,
    mobileMenuLabel,
    jumpToLabel,
    jumpToState,
  } = props;

  const [isMobile, setIsMobile] = useState(getIsMobile);

const [isOpen, setIsOpen] = useState(() => {
  const mobile = getIsMobile();
  return {
    main: !mobile,
    jump: !mobile,
  };
});


  // Defaults to closed on mobile, open on desktop
  // Have to do this in a lifecycle method
  // so that we can still server-side render
  useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < BREAKPOINT;

    setIsMobile((prev) => {
      if (prev === mobile) return prev;

      setIsOpen({
        main: !mobile,
        jump: !mobile,
      });

      return mobile;
    });
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  const handleMainNavToggle = () => {
    setIsOpen((prev) => ({
      main: !prev.main,
      jump: isMobile ? false : prev.jump || prev.main,
    }));
  };

  const handleJumpToToggle = () => {
    setIsOpen((prev) => ({
      jump: !prev.jump,
      main: isMobile ? false : prev.main || prev.jump,
    }));
  };

  return (
    <>
      <MainNavLinks
        links={mainLinks}
        isHomepage={isHomepage}
        editorButtonLabel={editorButtonLabel}
        donateButtonLabel={donateButtonLabel}
        mobileMenuLabel={mobileMenuLabel}
        hasJumpTo={jumpToState !== null}
        isOpen={isOpen.main}
        handleToggle={handleMainNavToggle}
      />
      <JumpToLinks
        heading={jumpToState?.heading || jumpToLabel}
        links={jumpToState?.links}
        isOpen={isOpen.jump}
        handleToggle={handleJumpToToggle}
      />
    </>
  );
};
