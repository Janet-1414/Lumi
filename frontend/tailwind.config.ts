import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──
        'bg-deep':        '#0A0F1E',
        'bg-card':        '#111827',
        'bg-card-hover':  '#141f35',
        'bg-input':       '#0D1425',
        'bg-surface':     '#0f1729',

        // ── Brand ──
        gold:             '#FAC775',
        'gold-dim':       '#c49a50',
        'gold-dark':      '#EF9F27',

        // ── Semantic ──
        teal:             '#1D9E75',
        'teal-dim':       '#0F6E56',
        'lumi-red':         '#D85A30',
        purple:           '#7F77DD',
        blue:             '#85B7EB',
        pink:             '#ED93B1',

        // ── Text ──
        'text-primary':   '#F0EAD6',
        'text-secondary': '#8899AA',
        'text-muted':     '#4a5568',
      },

      fontFamily: {
        head: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      borderRadius: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
      },

      boxShadow: {
        card:  '0 0 60px rgba(250,199,117,0.04), 0 24px 60px rgba(0,0,0,0.5)',
        gold:  '0 8px 24px rgba(250,199,117,0.25)',
        teal:  '0 8px 24px rgba(29,158,117,0.2)',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(250,199,117,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(250,199,117,0.7)' },
        },
        flicker: {
          '0%':   { transform: 'scale(1) rotate(-2deg)' },
          '50%':  { transform: 'scale(1.06) rotate(1deg)' },
          '100%': { transform: 'scale(0.98) rotate(-1deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },

      animation: {
        fadeUp:  'fadeUp 0.35s ease both',
        glow:    'glow 2s ease-in-out infinite',
        flicker: 'flicker 1.5s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}

export default config
