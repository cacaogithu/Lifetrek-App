/**
 * PostCSS config (root)
 * Keep this in CJS for maximum compatibility with Tailwind/PostCSS loaders.
 */
module.exports = {
  plugins: {
    tailwindcss: {
      config: "./tailwind.config.ts",
    },
    autoprefixer: {},
  },
};
