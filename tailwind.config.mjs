/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        serif: ['"VT323"', '"Share Tech Mono"', 'monospace'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        pixel: ['"VT323"', 'monospace'],
      },
      colors: {
        term: {
          bg: '#06140a',
          panel: '#0b1f10',
          border: '#2cbb4a',
          green: '#3cff5e',
          dim: '#1f7a35',
          amber: '#ffb000',
          red: '#ff4d4d',
          cyan: '#4dfff0',
        },
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(60,255,94,1)',
        'pixel-amber': '4px 4px 0px 0px rgba(255,176,0,1)',
      },
    },
  },
  plugins: [],
};
