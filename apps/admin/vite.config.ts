import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/",
    plugins: [
      devtools({ eventBusConfig: { port: 42_070 } }),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
      {
        name: "version-lock",
        apply: "build",
        closeBundle() {
          const distDir = path.resolve(process.cwd(), "dist");
          const rootPkgPath = path.resolve(
            process.cwd(),
            "../../package.json",
          );
          const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));
          const version = rootPkg.version || "0.0.0";
          mkdirSync(distDir, { recursive: true });
          writeFileSync(path.join(distDir, "version.lock"), version);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
    optimizeDeps: {
      exclude: ["@workspace/ui"],
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "https://api.npanel.dev",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      assetsDir: "static",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string): string | undefined {
            const MARKDOWN_VENDOR_PACKAGES = [
              "react-markdown",
              "react-syntax-highlighter",
              "refractor",
              "prismjs",
              "katex",
              "rehype-katex",
              "remark-math",
              "remark-gfm",
              "remark-toc",
              "remark-rehype",
              "remark-parse",
              "remark-stringify",
              "rehype-raw",
              "rehype",
              "unified",
              "mdast",
              "micromark",
              "hast",
              "hast-util",
              "hastscript",
              "trim-lines",
              "character-entities",
              "property-information",
              "space-separated-tokens",
              "comma-separated-tokens",
              "trough",
              "vfile",
              "unist",
              "unist-util",
              "bail",
              "is-plain-obj",
              "decode-named-character-reference",
              "html-url-attributes",
            ];
            const MARKDOWN_VENDOR_RE = new RegExp(
              `node_modules[/\\\\](${MARKDOWN_VENDOR_PACKAGES.map((p) =>
                p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              ).join("|")})[/\\\\]@?`,
            );
            if (MARKDOWN_VENDOR_RE.test(id)) {
              return "markdown-vendor";
            }
            return undefined;
          },
        },
      },
    },
  };
});
