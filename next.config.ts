import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["tiptap-markdown"],
  webpack: (config) => {
    const base = path.join(
      path.dirname(require.resolve("tiptap-markdown")),
      "..",
    );
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
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
    };
    return config;
  },
};

export default nextConfig;
