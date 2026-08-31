module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'ink-navy': '#132340',
        'paper': '#F6F5F1',
        'seal-red': '#A63A31',
        'verified-teal': '#1F7A66',
        'review-amber': '#C98A1F',
        'slate-ink': '#3B4252',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
