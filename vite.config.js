import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },

  plugins: [
    // Fallback SPA : /inscription, /menus, etc. → servir index.html
    // IMPORTANT : on ne touche PAS aux requêtes /api (elles passent par le proxy)
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req.url || "").split("?")[0];
          const accept = req.headers.accept || "";
          const isHtmlRequest = accept.includes("text/html");

          // ✅ Ne jamais intercepter l'API
          if (url.startsWith("/api")) return next();

          const isAsset =
            url.startsWith("/assets/") ||
            url.startsWith("/@") ||
            url.startsWith("/node_modules");

          const isStaticFile =
            url.startsWith("/pages/") ||
            url.startsWith("/partials/") ||
            url.includes(".");

          if (isHtmlRequest && !isAsset && !isStaticFile) {
            req.url = "/index.html";
          }

          next();
        });
      },
    },
  ],
});
