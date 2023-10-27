import type { Config } from "tailwindcss";

const config = {
	content: ["./src/**/*.{svelte,js,ts}"],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["dark"],
	},
} satisfies Config;
export default config;
