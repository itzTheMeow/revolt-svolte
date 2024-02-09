import express from "express";
import config from "./config";

console.log("Starting backend.");

const app = express();
app.use((_, res, next) => (res.setHeader("Cache-Control", "public, max-age=0"), next()));
app.use(express.static(process.cwd() + "/client/build"));
app.get("*", (req, res) => {
	res.sendFile(process.cwd() + "/client/build/index.html");
});
app.listen(config.port, () => {
	console.log(`Svolte is online and listening on port ${config.port}.`);
});
