interface Window {
  fathom?: {
    trackEvent(name: string, attrs?: Record<string, unknown>): void;
  };
}
