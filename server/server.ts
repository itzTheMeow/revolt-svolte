import express from "express";
import config from "./config";

export function init() {
  console.log("Starting backend.");

  const app = express();
  app.use((_, res, next) => (res.setHeader("Cache-Control", "public, max-age=0"), next()));
  app.use(express.static(process.cwd() + "/dist", { cacheControl: false }));
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  app.listen(config.port, () => {
    console.log(`Svolte is online and listening on port ${config.port}.`);
  });
}
