export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#121212',
        card: '#1E1E1E',
        accent: '#006465',
        accent2: '#00BCD4',
        text: '#FFFFFF',
        text2: '#B0B0B0',
        danger: '#FF5252',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
