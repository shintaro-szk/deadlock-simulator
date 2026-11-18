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
          solid: token('signal-solid'),
          'solid-hover': token('signal-solid-hover'),
        },
        ok: token('ok'),
        wait: token('wait'),
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
      // Sizes outside the default scale. 11px is the floor for dense mono data (tables, logs, graph labels).
      fontSize: {
        '2xs': '11px',
        ui: '13px',
        brand: '15px',
      },
      lineHeight: {
        display: '1.05',
      },
      maxWidth: {
        page: '78rem',
      },
      minHeight: {
        stage: '28rem',
      },
      minWidth: {
        step: '6.5rem',
      },
      // Touch screens. Controls get a 44px minimum target here; mouse layouts stay compact.
      screens: {
        coarse: { raw: '(pointer: coarse)' },
      },
    },
  },
  plugins: [],
}
