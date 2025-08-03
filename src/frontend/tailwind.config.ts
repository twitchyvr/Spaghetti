import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Microsoft-style Professional Blue Brand
        brand: {
          50: '#f3f9fd',
          100: '#e6f3fb',
          200: '#d1e7f7',
          300: '#a8d1f0',
          400: '#7ab5e8',
          500: '#5599df',
          600: '#0078d4', // Microsoft Blue
          700: '#106ebe',
          800: '#005a9e',
          900: '#004578',
          950: '#002a4a',
        },
        
        // Microsoft-inspired Palette
        microsoft: {
          blue: '#0078d4',
          blueDark: '#005a9e',
          blueLight: '#f3f9fd',
          gray: {
            10: '#faf9f8',
            20: '#f3f2f1',
            30: '#edebe9',
            40: '#e1dfdd',
            50: '#d2d0ce',
            60: '#c8c6c4',
            70: '#a19f9d',
            80: '#8a8886',
            90: '#605e5c',
            100: '#484644',
            110: '#323130',
            120: '#201f1e',
          },
        },
        
        // Professional neutral colors (Microsoft-inspired)
        professional: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Insurance industry colors (professional blues and greens)
        insurance: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        // Development colors (modern teals and grays)
        development: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        
        // Modern semantic colors with CSS variable fallbacks
        border: 'var(--color-border-primary, #e1e1e1)',
        input: 'var(--color-bg-primary, #ffffff)',
        ring: 'var(--color-brand-primary, #0078d4)',
        background: 'var(--color-bg-primary, #ffffff)',
        foreground: 'var(--color-text-primary, #323130)',
        primary: {
          DEFAULT: 'var(--color-brand-primary, #0078d4)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-tertiary, #f5f5f5)',
          foreground: 'var(--color-text-primary, #323130)',
        },
        destructive: {
          DEFAULT: 'var(--color-error, #d13438)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'var(--color-bg-tertiary, #f5f5f5)',
          foreground: 'var(--color-text-tertiary, #8a8886)',
        },
        accent: {
          DEFAULT: 'var(--color-bg-accent, #f0f0f0)',
          foreground: 'var(--color-text-primary, #323130)',
        },
        popover: {
          DEFAULT: 'var(--color-bg-primary, #ffffff)',
          foreground: 'var(--color-text-primary, #323130)',
        },
        card: {
          DEFAULT: 'var(--color-bg-primary, #ffffff)',
          foreground: 'var(--color-text-primary, #323130)',
        },
        
        // Professional status colors (Microsoft-inspired)
        success: {
          50: '#f3fdf3',
          100: '#e3f9e3',
          200: '#c7f2c7',
          300: '#9ae69a',
          400: '#65d765',
          500: '#107c10', // Microsoft Green
          600: '#0e6e0e',
          700: '#0c5f0c',
          800: '#0a4f0a',
          900: '#084008',
        },
        warning: {
          50: '#fff8f0',
          100: '#ffecd1',
          200: '#ffd4a3',
          300: '#ffb366',
          400: '#ff8f29',
          500: '#ff8c00', // Professional Orange
          600: '#e67c00',
          700: '#cc6e00',
          800: '#b35f00',
          900: '#995200',
        },
        error: {
          50: '#fdf3f3',
          100: '#fae6e6',
          200: '#f5cccc',
          300: '#eda5a5',
          400: '#e37676',
          500: '#d13438', // Microsoft Red
          600: '#b92b2f',
          700: '#a12327',
          800: '#8a1e1f',
          900: '#7d1a1c',
        },
        info: {
          50: '#f3f9fd',
          100: '#e6f3fb',
          200: '#d1e7f7',
          300: '#a8d1f0',
          400: '#7ab5e8',
          500: '#0078d4', // Microsoft Blue
          600: '#106ebe',
          700: '#005a9e',
          800: '#004578',
          900: '#003461',
        },
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', ...fontFamily.sans],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', ...fontFamily.mono],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', ...fontFamily.sans],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'progress': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'spin-slow': 'spin-slow 2s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'progress': 'progress 1s ease-in-out infinite',
      },
      
      boxShadow: {
        'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'elevation-4': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'elevation-5': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner-border': 'inset 0 0 0 1px rgb(0 0 0 / 0.1)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      screens: {
        xs: '475px',
        '3xl': '1680px',
        '4xl': '2560px',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            '[class~="lead"]': {
              color: 'hsl(var(--muted-foreground))',
            },
            a: {
              color: 'hsl(var(--primary))',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'ol[type="A"]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a"]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="A" s]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a" s]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="I"]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i"]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="I" s]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i" s]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="1"]': {
              '--list-counter-style': 'decimal',
            },
            'ol > li::marker': {
              fontWeight: '400',
              color: 'hsl(var(--muted-foreground))',
            },
            'ul > li::marker': {
              color: 'hsl(var(--muted-foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'hsl(var(--foreground))',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'hsl(var(--border))',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: 'hsl(var(--foreground))',
              fontWeight: '800',
            },
            h2: {
              color: 'hsl(var(--foreground))',
              fontWeight: '700',
            },
            h3: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            h4: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'figure figcaption': {
              color: 'hsl(var(--muted-foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'a code': {
              color: 'hsl(var(--primary))',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: 'hsl(var(--border))',
            },
            'thead th': {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
              verticalAlign: 'bottom',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              verticalAlign: 'baseline',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config;

export default config;