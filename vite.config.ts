import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // força a porta 3000
    strictPort: true // se 3000 estiver ocupada, dá erro ao invés de escolher outra porta
  }
});

