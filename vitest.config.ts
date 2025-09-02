import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

const base = path.join(path.dirname(require.resolve("tiptap-markdown")), "..");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tiptap-markdown/src/extensions/nodes/task-item": path.join(
        base,
        "src/extensions/nodes/task-item.js",
      ),
      "tiptap-markdown/src/extensions/nodes/list-item": path.join(
        base,
        "src/extensions/nodes/list-item.js",
      ),
      "tiptap-markdown/src/extensions/nodes/bullet-list": path.join(
        base,
        "src/extensions/nodes/bullet-list.js",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
