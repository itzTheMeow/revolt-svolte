import type { File } from "revolt-api";
import { writable } from "svelte/store";

export const imagePreview = writable<File | null>(null);
