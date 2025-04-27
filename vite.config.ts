import path from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
    base: path.resolve(__dirname, "dist/vue"),
    plugins: [vue(), vueDevTools()],
    build: {
        outDir: "dist/vue",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@constants": path.resolve(__dirname, "./src/constants"),
            "@types": path.resolve(__dirname, "./src/types"),
            "@api": path.resolve(__dirname, "./src/api"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@assets": path.resolve(__dirname, "./src/assets"),
        },
    },
});
