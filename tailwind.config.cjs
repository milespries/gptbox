const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", "./node_modules/flowbite/**/*.js"],

  darkMode: 'class',

  theme: {
    extend: {}
  },

  plugins: [
    require('flowbite/plugin')
  ]
};

module.exports = config;