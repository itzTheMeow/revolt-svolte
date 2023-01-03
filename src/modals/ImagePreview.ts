import type { Attachment } from "revolt-toolset";
import { writable } from "svelte/store";

export const imagePreview = writable<Attachment | null>(null);
