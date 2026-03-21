/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'chinese-black': '#0C1519',
        'jungle-green':  '#162127',
        'jet':           '#3A3534',
        'coffee':        '#724B39',
        'brass':         '#CF9D7B',
        'success':       '#5a7a4a',
        'success-text':  '#8aad6e',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        ui:      ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
