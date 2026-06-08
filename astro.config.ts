import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sin471.github.io',
  base: process.env.BASE_URL ?? '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
