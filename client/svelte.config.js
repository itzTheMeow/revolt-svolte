import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],

	kit: {
		adapter: adapter({
			fallback: "index.html",
		}),
	},
	onwarn: (warning, handler) => {
		if (warning.code.startsWith("a11y-")) {
			return;
		}
		handler(warning);
	},
};

export default config;
