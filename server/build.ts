import fs from "fs";
import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import postCssPlugin from "esbuild-style-plugin";
import useTailwind from "tailwindcss";
import useAutoprefixer from "autoprefixer";
import { init } from "./server";

console.log("Building client...");
esbuild
  .build({
    entryPoints: [`./src/index.ts`],
    bundle: true,
    outdir: `./dist`,
    mainFields: ["svelte", "browser", "module", "main"],
    minify: false,
    sourcemap: "inline",
    splitting: true,
    write: true,
    format: `esm`,
    watch: process.argv.includes(`--watch`),
    plugins: [
      esbuildSvelte({
        preprocess: sveltePreprocess(),
      }),
      postCssPlugin({
        postcss: {
          plugins: [useTailwind, useAutoprefixer],
        },
      }),
    ],
    logLevel: "info",
    target: "es6",
    loader: { ".png": "file" },
  })
  .then(() => {
    fs.copyFileSync("src/index.html", "dist/index.html");
    fs.copyFileSync("svolte-logo.png", "dist/logo.png");
    fs.copyFileSync("svolte-logo.ico", "dist/favicon.ico");
    init();
  })
  //@ts-ignore
  .catch((error, location) => {
    console.warn(`Errors: `, error, location);
    process.exit(1);
  });
