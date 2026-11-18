/** @type {import('tailwindcss').Config} */

// Map a CSS variable that holds RGB channels to a Tailwind colour with opacity support.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // The app is dark only. index.html sets class="dark" on <html>.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: {
          DEFAULT: token('surface'),
          2: token('surface-2'),
        },
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
        },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          faint: token('fg-faint'),
        },
        signal: {
          DEFAULT: token('signal'),
          strong: token('signal-strong'),
          dim: token('signal-dim'),
        },
        ok: token('ok'),
        wait: token('wait'),

        // Temporary aliases for the old components. Phase 20 removes them.
        process: {
          DEFAULT: token('fg'),
          hover: token('fg-muted'),
        },
        resource: {
          DEFAULT: token('fg-muted'),
          hover: token('fg'),
        },
        deadlock: token('signal'),
        waiting: token('wait'),
        safe: token('ok'),
        // Temporary: the old components use gray-* with dark: variants. Phase 20 removes this.
        gray: {
          50: token('fg'),
          100: token('fg'),
          200: token('line'),
          300: token('fg-muted'),
          400: token('fg-muted'),
          500: token('fg-faint'),
          600: token('line-strong'),
          700: token('surface-2'),
          800: token('surface'),
          900: token('bg'),
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Sans Condensed"', '"IBM Plex Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '3px',
        lg: '4px',
      },
    },
  },
  plugins: [],
}
