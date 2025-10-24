import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    allowedHosts: [
      "f2ed7667-54dc-48f8-aca8-3fc20a3e643d-00-2figax8w6b8vp.riker.replit.dev",
      // or simply ".replit.dev" if you want to allow all replit subdomains
      // ".replit.dev"
    ],
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            if (id.includes("three") || id.includes("@react-three")) {
              return "three-vendor";
            }
            if (id.includes("@radix-ui")) {
              return "ui-vendor";
            }
            if (id.includes("@tanstack/react-query")) {
              return "query-vendor";
            }
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            return "vendor";
          }
          // Split large page components
          if (id.includes("/pages/")) {
            const match = id.match(/pages\/(.+)\.(tsx|ts)/);
            if (match) {
              return `page-${match[1].toLowerCase()}`;
            }
          }
          // Split 3D components separately for lazy loading
          if (id.includes("/components/3d/")) {
            return "3d-components";
          }
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
}));
