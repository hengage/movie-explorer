import { resolve } from 'path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        search: resolve(__dirname, 'search/index.html'),
        movie: resolve(__dirname, 'movie/index.html'),
        favorites: resolve(__dirname, 'favorites/index.html'),
      },
    },
  },
});
