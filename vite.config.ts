import "dotenv/config";
import path from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const port = parseInt(process.env.VITE_PORT || "5173");

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    base: "./",
    server: {
        port,
    },
    build: {
        outDir: "dist/vue",
        assetsDir: "assets",
        rollupOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash][extname]",
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
