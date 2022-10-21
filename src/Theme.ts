import { writable } from "svelte/store";
import { DEFAULT_THEME, type ThemeSettings } from "revolt-toolset";

export const Theme = writable<ThemeSettings>({ ...DEFAULT_THEME });
