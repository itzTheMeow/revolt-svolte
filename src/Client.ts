import { DEFAULT_THEME } from "revolt-toolset";
import { Client } from "revolt.js";
import { Theme } from "Theme";

export const client = new Client({
  autoReconnect: true,
});
client.once("ready", async () => {
  try {
    const theme =
      JSON.parse((await client.syncFetchSettings(["theme"])).theme[1])[
        "appearance:theme:overrides"
      ] || {};
    Theme.set({ ...DEFAULT_THEME, ...theme });
    localStorage.setItem("theme", JSON.stringify(theme));
  } catch {}
});
