import { useEffect, useRef } from "preact/hooks";

const TIME_LABELS: Record<number, string> = {
  10000: "Focus 10s",
  30000: "Focus 30s",
  90000: "Focus 90s",
  300000: "Focus 5min",
  600000: "Focus 10min",
};

const SCROLL_LABELS: Record<number, string> = {
  25: "Scroll 25%",
  50: "Scroll 50%",
  75: "Scroll 75%",
  100: "Scroll 100%",
};

const track = (label: string) => {
  // Fathom analytics does not use cookies. The data collected
  // is aggregate and minimal. The scope is currently only on
  // the Reference page, but it can be generalized in the future.
  if (window.fathom && window.location.pathname.startsWith("/reference/")) {
    window.fathom.trackEvent(label);
  }
};

const ReferenceTracker = ({
  timeThresholds,
  scrollThresholds,
}: {
  timeThresholds: number[];
  scrollThresholds: number[];
}) => {
  const hasFiredTime = useRef<Set<number>>(new Set());
  const hasFiredScroll = useRef<Set<number>>(new Set());
  const elapsed = useRef(0);

  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      elapsed.current += 1000;
      for (const ms of timeThresholds) {
        if (elapsed.current >= ms && !hasFiredTime.current.has(ms)) {
          hasFiredTime.current.add(ms);
          track(TIME_LABELS[ms]);
        }
      }
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      for (const t of scrollThresholds) {
        if (pct >= t && !hasFiredScroll.current.has(t)) {
          hasFiredScroll.current.add(t);
          track(SCROLL_LABELS[t]);
        }
      }
    };

    const interval = setInterval(tick, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
    };
  }, [timeThresholds, scrollThresholds]);

  return null;
};

export default ReferenceTracker;