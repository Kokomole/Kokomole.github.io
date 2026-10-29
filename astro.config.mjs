import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kokomole.github.io',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
