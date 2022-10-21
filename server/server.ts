import axios from "axios";
import express from "express";
import config from "./config";
import sharp from "sharp";

export function init() {
  console.log("Starting backend.");

  const app = express();
  app.use(express.static(process.cwd() + "/dist"));
  app.get("/proxy", async (req, res) => {
    const url = String(req.query.url);
    if (!url) return res.sendStatus(200);
    const type = String(req.query.t) as "any" | "image";
    try {
      const data = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const fetched = {
        type: data.headers["content-type"],
        buffer: Buffer.from(data.data, "binary"),
      };
      switch (type) {
        case "any": {
          return res.contentType(fetched.type).end(fetched.buffer);
        }
        case "image": {
          if (fetched.type == "image/webp") {
            fetched.type = "image/png";
            fetched.buffer = await sharp(fetched.buffer).png().toBuffer();
          }
          return res.contentType(fetched.type).end(fetched.buffer);
        }
        default: {
          return res.sendStatus(200);
        }
      }
    } catch (err) {
      try {
        console.error(err);
        return res.sendStatus(200);
      } catch {}
    }
  });
  app.get("*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });
  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}.`);
  });
}
