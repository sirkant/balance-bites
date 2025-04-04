import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    server: {
      port: 8080,
      strictPort: true,
      host: true
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define specific env variables that should be exposed to the client
    define: {
      // Ensure no sensitive variables are leaked to the client
      // Only VITE_ prefixed variables should be available
      // '__ENV_OPENAI_API_KEY__': JSON.stringify(false), // Ensure this is not included
    },
    build: {
      // Improve build output
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code into separate chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@/components/ui'],
          },
        },
      },
    },
  };
});
