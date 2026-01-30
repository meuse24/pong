import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const renameHtmlPlugin = () => ({
  name: "rename-html",
  enforce: "post",
  generateBundle(_, bundle) {
    const target = "index.html";
    if (!bundle[target]) return;
    const asset = bundle[target];
    if (asset.type !== "asset") return;
    asset.fileName = "pong.html";
    delete bundle[target];
    bundle[asset.fileName] = asset;
  },
});

export default defineConfig({
  base: "./",
  plugins: [viteSingleFile(), renameHtmlPlugin()],
  build: {
    target: "es2018",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        pong: "index.html",
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
});
