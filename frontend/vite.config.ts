import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true // Automatically open browser
    },
    define: {
      // Explicitly define the API key string to ensure it's replaced correctly in the browser code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill the rest of process.env just in case, but securely
      'process.env': JSON.stringify(env)
    }
  };
});