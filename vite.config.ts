import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '({})',
    process: '({env:{NODE_ENV:"production"}})',
  },
  build: {
    copyPublicDir: true,
    lib: {
      entry: 'src/main.tsx',
      name: 'RisingTideWidget',
      fileName: () => 'widget.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
