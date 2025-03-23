import type { JumpToState } from "@/src/globals/state";
import { JumpToLinks } from "./JumpToLinks";
import { MainNavLinks } from "./MainNavLinks";
import { useEffect, useState } from "preact/hooks";

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

  const [isOpen, setIsOpen] = useState({ main: false, jump: false });
  const [isMobile, setIsMobile] = useState(true);

  // Defaults to closed on mobile, open on desktop
  // Have to do this in a lifecycle method
  // so that we can still server-side render
  useEffect(() => {
    const startsMobile = window.innerWidth < 768;
    setIsMobile(startsMobile);
    setIsOpen({ main: !startsMobile, jump: !startsMobile });
    // We use a resize observer to the user's window crosses the
    // threshhold between mobile and desktop
    const documentObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!isMobile && entry.contentRect.width < 768) {
          setIsMobile(true);
          setIsOpen({
            main: false,
            jump: false,
          });
        } else if (isMobile && entry.contentRect.width >= 768) {
          setIsMobile(false);
          setIsOpen({
            main: true,
            jump: true,
          });
        }
      }
    });
    documentObserver.observe(document.body);
    return () => documentObserver.disconnect();
  }, [setIsMobile, setIsOpen, isMobile]);

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
