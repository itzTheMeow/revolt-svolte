import useAutoprefixer from "autoprefixer";
import { execSync } from "child_process";
import esbuild from "esbuild";
import postCssPlugin from "esbuild-style-plugin";
import esbuildSvelte from "esbuild-svelte";
import fs from "fs";
import sveltePreprocess from "svelte-preprocess";
import useTailwind from "tailwindcss";
import { injectManifest } from "workbox-build";
import config from "./config";
import { init } from "./server";

const standalone = process.argv.includes("--standalone");

console.log("Building client...");
const hash = execSync("git rev-parse --short HEAD").toString().trim(),
  loader: esbuild.Loader = standalone ? "base64" : "file";
esbuild
  .build({
    entryPoints: [`./src/index.ts`],
    bundle: true,
    outdir: `./dist`,
    mainFields: ["svelte", "browser", "module", "main"],
    minify: true,
    sourcemap: standalone ? "inline" : "external",
    splitting: !standalone,
    write: true,
    format: standalone ? "iife" : "esm",
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
    loader: { ".png": loader, ".ttf": loader, ".woff": loader, ".woff2": loader },
  })
  .then(() => {
    let html = fs.readFileSync("src/index.html").toString();
    if (standalone)
      html = html.replace(
        `<script type="module"`,
        `<script>window.STANDALONE=true;</script><script`
      );
    fs.copyFileSync("svolte-logo.png", "dist/logo.png");
    fs.copyFileSync("svolte-logo-optimized.svg", "dist/logo.svg");
    fs.copyFileSync("svolte-logo.ico", "dist/favicon.ico");
    fs.writeFileSync(
      "dist/index.html",
      html.replace("%CommitHash%", hash).replace(/%BrandName%/g, config.brandName)
    );
    const sw = esbuild.buildSync({
      entryPoints: ["./src/sw.ts"],
      bundle: true,
      write: false,
      minify: true,
    }).outputFiles[0].text;
    fs.writeFileSync("dist/sw.js", sw.replace("%CommitHash%", hash));
    injectManifest({
      swSrc: "./dist/sw.js",
      swDest: "./dist/sw.js",
      globDirectory: "./dist",
      globPatterns: ["**/*.html", "**/*.js", "**/*.css", "**/*.svg", "**/*.png", "**/*.ttf"],
    });
    if (standalone) {
      console.log("Standalone build finished!");
      process.exit();
    }
    init();
  })
  //@ts-ignore
  .catch((error, location) => {
    console.warn(`Errors: `, error, location);
    process.exit(1);
  });
