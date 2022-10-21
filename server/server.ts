import express from "express";
import config from "./config";

export function init() {
  console.log("Starting backend.");

  const app = express();
  app.use(express.static(process.cwd() + "/dist"));
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });
}
