import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  root: "./src",
  //base: "", // użyj pustego stringa dla ścieżek względnych
  build: {
    outDir: "../dist",
    minify: false,
    emptyOutDir: true,
  },
  appType: "spa",
  plugins: [tsconfigPaths(),viteStaticCopy({
    targets: [
      {
        src: 'release/config.json', // Ścieżka do Twojego pliku config.json
        dest: ''           // Katalog docelowy (pusty oznacza katalog główny builda)
      }
    ]
  })],
  server: {
    host: 'localhost',
    port: 5173,
    
    //historyApiFallback: true // Przekierowanie wszystkich ścieżek do aplikacji React
  },
});

