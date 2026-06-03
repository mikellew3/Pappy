/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f1e8',
        'bg-2': '#ebe5d4',
        ink: '#1a1a1a',
        'ink-soft': '#4a4a4a',
        'ink-faint': '#8a8578',
        green: '#1d4d2e',
        'green-soft': '#2a6b3f',
        gold: '#b8860b',
        'gold-soft': '#d4a72c',
        red: '#8b1e1e',
        line: '#d4cdb8',
        'line-soft': '#e3ddc9',
        card: '#fbf8f0',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
