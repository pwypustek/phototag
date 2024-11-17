import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "./src",
  //base: "", // użyj pustego stringa dla ścieżek względnych
  build: {
    outDir: "../dist",
    minify: false,
    emptyOutDir: true,
  },
  appType: "spa",
  plugins: [tsconfigPaths()],
  server: {
    host: 'localhost',
    port: 5173,
    
    //historyApiFallback: true // Przekierowanie wszystkich ścieżek do aplikacji React
  },
});

