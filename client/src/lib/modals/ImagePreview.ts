import type { Attachment } from "revkit";
import { writable } from "svelte/store";

export const imagePreview = writable<
	Attachment | { url: string; metadata: { width: number; height: number; type: "Image" } } | null
>(null);
