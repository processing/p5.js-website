const hitBox = document.getElementById("settings-hitbox");
const settingsContainer = document.getElementById("settings-container");
const settingsPlaceholder = document.getElementById("settings-placeholder");
let isHovering = false;
let lastScrollTop = 0;
const SCROLL_THRESHOLD = 50;
let interactionTimeout; // Timeout for opening and closing the settings container
let isContainerVisible = false; // Flag to track visibility of settings container
// Observer callback to toggle isContainerVisible based on intersection with viewport
const observerCallback = (entries) => {
  entries.forEach((entry) => {
    isContainerVisible = entry.isIntersecting;
    if (isContainerVisible) {
      settingsContainer.classList.remove("scrolled-outside-view");
    } else {
      settingsContainer.classList.add("scrolled-outside-view");
    }
  });
};

// Create an observer instance.
// This will be used to track the visibility of the settings container placeholder
// So we can avoid opening the settings container when the top of the page is reached
const observer = new IntersectionObserver(observerCallback);
observer.observe(settingsPlaceholder);

function openSettings(scroll = false) {
  if (isContainerVisible) return; // Don't open if already visible
  settingsContainer?.classList.add("open");
  if (!scroll) {
    isHovering = true;
  }
  resetInteractionTimeout();
}

function closeSettings() {
  clearTimeout(interactionTimeout);
  if (!isHovering) settingsContainer?.classList.remove("open");
}

function resetInteractionTimeout() {
  clearTimeout(interactionTimeout);
  interactionTimeout = setTimeout(closeSettings, 2000);
}

hitBox?.addEventListener(
  "mouseenter",
  () => !isContainerVisible && openSettings(),
);
settingsContainer?.addEventListener(
  "mouseenter",
  () => !isContainerVisible && openSettings(),
);

hitBox?.addEventListener("mouseleave", () => {
  isHovering = false;
  interactionTimeout = setTimeout(closeSettings, 600);
});
settingsContainer?.addEventListener("mouseleave", () => {
  isHovering = false;
  interactionTimeout = setTimeout(closeSettings, 600);
});

settingsContainer?.addEventListener("mousemove", resetInteractionTimeout);
settingsContainer?.addEventListener("click", resetInteractionTimeout);

// Keeps track of how many clicked anchors we're waiting for
let activeAnchorScrolls = 0;

// Returns a promise that resolves when scrolling stops. It checks every 200ms
// until the scrollTop stops changing.
function waitUntilScrollFinishes() {
  return new Promise((resolve) => {
    let prevScrollTop = window.scrollY || document.documentElement.scrollTop;
    const wait = () => setTimeout(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop === prevScrollTop) {
        resolve()
      } else {
        prevScrollTop = scrollTop;
        wait();
      }
    }, 200);
    wait();
  })
}

// When the user scrolls up, open the settings container
window.addEventListener(
  "scroll",
  () => {
    let currentScroll = window.scrollY || document.documentElement.scrollTop;

    if (activeAnchorScrolls > 0) {
      // Do nothing if the scroll is from clicking an anchor link
    } else if (currentScroll < 120) {
      // if we're scrolled up to where the container lives, close immediately
      closeSettings();
    } else if (
      lastScrollTop > currentScroll &&
      lastScrollTop - currentScroll > SCROLL_THRESHOLD &&
      !isContainerVisible // Only trigger on scroll if the container is not visible
    ) {
      openSettings(true);
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  },
  false,
);

const preventSettings = () => {
  activeAnchorScrolls++;
  waitUntilScrollFinishes().then(() => {
    activeAnchorScrolls--;
  });
};

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeName === 'A' && node.getAttribute('href') && node.getAttribute('href').startsWith('#')) {
        node.addEventListener('click', preventSettings);
      }
    }
  }
});
mutationObserver.observe(document, { childList: true });
window.addEventListener('load', () => {
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    a.addEventListener('click', preventSettings);
  }
});
