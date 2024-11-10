import { defineConfig } from "vite";

export default defineConfig({
  base: "./loomalearn",
  build: {
    minify: "terser",
  },
});