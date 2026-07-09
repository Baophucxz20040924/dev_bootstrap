import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy API + install + binary endpoints to the Node backend.
const proxy = {
  '/api': 'http://localhost:4000',
  '/install': 'http://localhost:4000',
  '/bin': 'http://localhost:4000',
  '/db': 'http://localhost:4000',
};

export default defineConfig({
  plugins: [react()],
  // host: true binds to 0.0.0.0 so other machines on the LAN can reach it.
  server: { host: true, port: 5173, proxy },
  preview: { host: true, port: 4173, proxy },
});
