import type { JumpToState } from "@/src/globals/state";
import { JumpToLinks } from "./JumpToLinks";
import { MainNavLinks } from "./MainNavLinks";
import { useEffect, useState } from "preact/hooks";

interface NavLinksProps {
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

export const NavLinks = (props: NavLinksProps) => {
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

  const isMobile = () => window.innerWidth <= 768;

  // Defaults to closed on mobile, open on desktop
  // Have to do this in a lifecycle method
  // so that we can still server-side render
  useEffect(() => {
    setIsOpen({ main: !isMobile(), jump: !isMobile() });
  }, []);

  const handleMainNavToggle = () => {
    setIsOpen((prev) => ({
      main: !prev.main,
      jump: isMobile() ? false : prev.jump || prev.main,
    }));
  };

  const handleJumpToToggle = () => {
    setIsOpen((prev) => ({
      jump: !prev.jump,
      main: isMobile() ? false : prev.main || prev.jump,
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
        toggleCallback={handleMainNavToggle}
      />
      <JumpToLinks
        heading={jumpToState?.heading || jumpToLabel}
        links={jumpToState?.links}
        isOpen={isOpen.jump}
        toggleCallback={handleJumpToToggle}
      />
    </>
  );
};
