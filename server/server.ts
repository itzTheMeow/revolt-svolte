import express from "express";
import config from "./config";

export function init() {
  console.log("Starting backend.");

  const app = express();
  app.get("/manifest.webmanifest", (_, res) =>
    res
      .contentType("application/manifest+json")
      .status(200)
      .send(
        JSON.stringify({
          background_color: "#242424",
          description: "A simpler Revolt client.",
          display: "standalone",
          icons: [
            {
              src: "logo.svg",
              sizes: "512x512",
              type: "image/svg+xml",
            },
          ],
          name: "Svolte",
          start_url: "/",
          theme_color: "#ff4654",
          orientation: "portrait",
        })
      )
  );
  app.use(express.static(process.cwd() + "/dist"));
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });
}
