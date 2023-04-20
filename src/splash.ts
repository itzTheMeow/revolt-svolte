import { Native } from "Native";

function doSplash(logo: HTMLImageElement) {
  const { width, height } = window.screen,
    logoSize = Math.min(logo.width, logo.height) / 3,
    ratio = window.devicePixelRatio,
    canvas = document.createElement("canvas");
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(ratio, ratio);
  ctx.fillStyle = "#101823";
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(logo, width / 2 - logoSize / 2, height / 2 - logoSize / 2, logoSize, logoSize);

  const link = document.createElement("link");
  link.setAttribute("rel", "apple-touch-startup-image");
  link.setAttribute("href", canvas.toDataURL());
  document.head.appendChild(link);
}

export default function generateSplash() {
  if ((<any>window).standalone || Native.isNative) return;

  const icon = new Image();
  icon.onload = () => doSplash(icon);
  icon.src = "./logo.png";
}
