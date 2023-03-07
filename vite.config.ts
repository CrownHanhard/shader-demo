import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
function resolve(dir: string) {
  return path.resolve(__dirname, dir);
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },
  assetsInclude: ['**/*.glsl']
});
