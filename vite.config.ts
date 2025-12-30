import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false, // Prevents full screen error overlay for connection issues
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Firebase (grande biblioteca)
          'firebase': [
            '@firebase/firestore',
            '@firebase/auth',
            '@firebase/storage',
            '@firebase/app',
          ],

          // TanStack Query
          'tanstack': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],

          // UI Libraries
          'recharts': ['recharts'],
          'lucide': ['lucide-react'],

          // Zustand & State
          'state': ['zustand'],
        },
      },
    },
    // Aumentar limite para 600kb (ainda vai avisar mas não quebra build)
    chunkSizeWarningLimit: 600,
  },
});
