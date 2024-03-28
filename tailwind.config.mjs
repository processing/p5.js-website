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
      colors: {
        "bg-yellow": "var(--bg-yellow)",
        "bg-taupe": "var(--bg-taupe)",
        "bg-orange": "var(--bg-orange)",
        "bg-magenta-70": "var(--bg-magenta-70)",
        "bg-magenta-20": "var(--bg-magenta-20)",
        "bg-gray": "var(--bg-gray)",
        "bg-green": "var(--bg-green)",
        "bg-blue": "var(--bg-blue)",
        "bg-white": "var(--bg-white)",
        "bg-black": "var(--bg-black)",
        "type-black": "--type-black",
        "type-white": "--type-white",
        "type-magenta": "--type-magenta",
        "type-blue": "--type-blue",
        "type-gray": "--type-gray",
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
    },
  },
  plugins: [],
};
