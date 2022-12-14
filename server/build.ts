import useAutoprefixer from "autoprefixer";
import { execSync } from "child_process";
import esbuild from "esbuild";
import postCssPlugin from "esbuild-style-plugin";
import esbuildSvelte from "esbuild-svelte";
import fs from "fs";
import sveltePreprocess from "svelte-preprocess";
import useTailwind from "tailwindcss";
import config from "./config";
import { init } from "./server";

console.log("Building client...");
const hash = execSync("git rev-parse --short HEAD").toString().trim();
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
        filterWarnings: (w) => !w.code.startsWith("a11y-"),
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
    loader: { ".png": "file", ".ttf": "file", ".woff": "file", ".woff2": "file" },
  })
  .then(() => {
    const html = fs.readFileSync("src/index.html").toString();
    fs.writeFileSync(
      "dist/index.html",
      html.replace("%CommitHash%", hash).replace(/%BrandName%/g, config.brandName)
    );
    fs.copyFileSync("svolte-logo.png", "dist/logo.png");
    fs.copyFileSync("svolte-logo.ico", "dist/favicon.ico");
    init();
  })
  //@ts-ignore
  .catch((error, location) => {
    console.warn(`Errors: `, error, location);
    process.exit(1);
  });
