import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist/client",
    commonjsOptions: { include: [/node_modules/, /src\/(?:I18n|LiveEdit|Appearance|LayoutView|DailyCover|NativeDailyCover|ProfileText|ProfileSections|ProfileFields|ProfileClock|UserGroups|ProfileHeaderView|ActivityView|Presenter)\.js$/] },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "127.0.0.1",
    port: 8788,
    strictPort: true,
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:*; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'self'",
      "Referrer-Policy": "no-referrer",
    },
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
