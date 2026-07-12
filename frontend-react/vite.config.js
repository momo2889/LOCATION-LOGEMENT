import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config Vite — serveur de dev sur le port 5173, ouvert automatiquement.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Les fichiers téléversés (photos, panoramas 360°) sont servis par le backend
    // Laravel (:8000). On les proxifie sous la même origine que le front pour que
    // Pannellum puisse charger le panorama dans une texture WebGL sans être bloqué
    // par CORS (une image cross-origin en crossOrigin="anonymous" échoue sinon).
    proxy: {
      '/storage': 'http://127.0.0.1:8000',
    },
  },
});
