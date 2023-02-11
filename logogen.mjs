#!/usr/bin/env node

import { createCanvas, loadImage } from "canvas";
import fs from "fs";

console.log("Generating...");
if (!fs.existsSync("generated")) fs.mkdirSync("generated");
!(async () => {
  // https://developer.apple.com/design/human-interface-guidelines/foundations/layout/#device-screen-sizes-and-orientations
  // just a copy/paste
  const sizeDoc = `12.9" iPad Pro 	1024x1366 pt (2048x2732 px @2x)
  11" iPad Pro 	834x1194 pt (1668x2388 px @2x)
  10.5" iPad Pro 	834x1194 pt (1668x2388 px @2x)
  9.7" iPad Pro 	768x1024 pt (1536x2048 px @2x)
  7.9" iPad mini 	768x1024 pt (1536x2048 px @2x)
  10.5" iPad Air 	834x1112 pt (1668x2224 px @2x)
  9.7" iPad Air 	768x1024 pt (1536x2048 px @2x)
  10.2" iPad 	810x1080 pt (1620x2160 px @2x)
  9.7" iPad 	768x1024 pt (1536x2048 px @2x)
  iPhone 14 Pro Max 	430x932 pt (1290x2796 px @3x)
  iPhone 14 Pro 	393x852 pt (1179x2556 px @3x)
  iPhone 14 Plus 	428x926 pt (1284x2778 px @3x)
  iPhone 14 	390x844 pt (1170x2532 px @3x)
  iPhone 13 Pro Max 	428x926 pt (1284x2778 px @3x)
  iPhone 13 Pro 	390x844 pt (1170x2532 px @3x)
  iPhone 13 	390x844 pt (1170x2532 px @3x)
  iPhone 13 mini 	375x812 pt (1125x2436 px @3x)
  iPhone 12 Pro Max 	428x926 pt (1284x2778 px @3x)
  iPhone 12 Pro 	390x844 pt (1170x2532 px @3x)
  iPhone 12 	390x844 pt (1170x2532 px @3x)
  iPhone 12 mini 	375x812 pt (1125x2436 px @3x)
  iPhone 11 Pro Max 	414x896 pt (1242x2688 px @3x)
  iPhone 11 Pro 	375x812 pt (1125x2436 px @3x)
  iPhone 11 	414x896 pt (828x1792 px @2x)
  iPhone XS Max 	414x896 pt (1242x2688 px @3x)
  iPhone XS 	375x812 pt (1125x2436 px @3x)
  iPhone XR 	414x896 pt (828x1792 px @2x)
  iPhone X 	375x812 pt (1125x2436 px @3x)
  iPhone 8 Plus 	414x736 pt (1080x1920 px @3x)
  iPhone 8 	375x667 pt (750x1334 px @2x)
  iPhone 7 Plus 	414x736 pt (1080x1920 px @3x)
  iPhone 7 	375x667 pt (750x1334 px @2x)
  iPhone 6s Plus 	414x736 pt (1080x1920 px @3x)
  iPhone 6s 	375x667 pt (750x1334 px @2x)
  iPhone 6 Plus 	414x736 pt (1080x1920 px @3x)
  iPhone 6 	375x667 pt (750x1334 px @2x)
  4.7" iPhone SE 	375x667 pt (750x1334 px @2x)
  4" iPhone SE 	320x568 pt (640x1136 px @2x)
  iPod touch 5th generation and later 	320x568 pt (640x1136 px @2x)`;

  const sizes = [...sizeDoc.matchAll(/(\d+)x(\d+) px @(\d+)x/g)]
      .map((m) => ({
        w: Number(m[1]),
        h: Number(m[2]),
        ratio: Number(m[3]),
      }))
      .map((m) => ({
        ...m,
        filename: `apple-touch-${m.w}x${m.h}-${m.ratio}.png`,
        size: Math.min(m.w, m.h) / 2,
      })),
    logo = await loadImage("svolte-logo-optimized.svg");

  sizes.forEach((s) => {
    console.log(`=> ${s.filename}`);
    const canvas = createCanvas(s.w, s.h),
      ctx = canvas.getContext("2d");
    ctx.fillStyle = "#101823";
    ctx.fillRect(0, 0, s.w, s.h);
    ctx.drawImage(logo, s.w / 2 - s.size / 2, s.h / 2 - s.size / 2, s.size, s.size);
    fs.writeFileSync(`generated/${s.filename}`, canvas.toBuffer());
  });
  fs.writeFileSync(
    `generated/apple-touch.html`,
    sizes
      .map(
        (s) =>
          `<link rel="apple-touch-startup-image" media="(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.ratio})" href="/${s.filename}" />`
      )
      .join("\n")
  );
})();
