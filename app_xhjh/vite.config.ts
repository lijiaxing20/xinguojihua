import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5200,
    hmr: {
      path: '/ws',
    },
    // proxy: {
    //   '/api': {
    //     target: 'http://www.xinghuojihua.com',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/uploads': {
    //     target: 'http://www.xinghuojihua.com',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/assets': {
    //     target: 'http://www.xinghuojihua.com',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
  define: {
    'process.env': {},
  },
}));
