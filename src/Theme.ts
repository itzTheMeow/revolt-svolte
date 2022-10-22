import { writable } from "svelte/store";
import { DEFAULT_THEME, type ThemeSettings } from "revolt-toolset";

export const Theme = writable<ThemeSettings>({
  ...DEFAULT_THEME,
  ...JSON.parse(localStorage.getItem("theme") || "{}"),
});
Theme.subscribe((v) => {
  document.body.style.setProperty("--accent", v["accent"] || DEFAULT_THEME.accent!);
  document.body.style.color = v["foreground"] || DEFAULT_THEME.foreground!;
});
