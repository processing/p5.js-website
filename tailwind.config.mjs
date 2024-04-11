/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // These values are mirrored in variables.scss
    screens: {
      md: "767px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      maxWidth: (theme) => ({
        "screen-md": theme("screens.md"),
        "screen-lg": theme("screens.lg"),
        "screen-xl": theme("screens.xl"),
      }),
      colors: {
        "bg-yellow": "var(--bg-yellow)",
        "bg-taupe": "var(--bg-taupe)",
        "bg-orange": "var(--bg-orange)",
        "bg-magenta-70": "var(--bg-magenta-70)",
        "bg-magenta-20": "var(--bg-magenta-20)",
        "bg-gray-40": "var(--bg-gray-40)",
        "bg-gray-20": "var(--bg-gray-20)",
        "bg-green": "var(--bg-green)",
        "bg-blue": "var(--bg-blue)",
        "bg-white": "var(--bg-white)",
        "bg-black": "var(--bg-black)",
        "type-black": "var(--type-black)",
        "type-white": "var(--type-white)",
        "type-magenta": "var(--type-magenta)",
        "type-blue": "var(--type-blue)",
        "type-gray": "var(--type-gray)",
        "logo-color": "var(--logo-color)",
        "bg-color": "var(--bg-color)",
        "type-color": "var(--type-color)",
        "sidebar-bg-color": "var(--sidebar-bg-color)",
        "sidebar-type-color": "var(--sidebar-type-color)",
        "accent-color": "var(--accent-color)",
        "accent-type-color": "var(--accent-type-color)",
      },
      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
      },
      spacing: {
        xxs: "var(--spacing-xxs)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "5xl": "var(--spacing-5xl)",
      },
      animation: {
        "spin-slow": "spin 4s linear infinite",
      },
    },
  },
  plugins: [],
};
