import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			srcDir: "src",
			filename: "sw.ts",
			strategies: "injectManifest",
			manifest: {
				name: "Revolt",
				short_name: "Revolt",
				description: "User-first, privacy-focused chat platform.",
				categories: ["communication", "chat", "messaging"],
				start_url: "/",
				orientation: "portrait",
				/*display_override: ["window-controls-overlay"],*/
				display: "standalone",
				background_color: "#101823",
				theme_color: "#101823",
				icons: [
					{
						src: `/assets/icons/android-chrome-192x192.png`,
						type: "image/png",
						sizes: "192x192",
					},
					{
						src: `/assets/icons/android-chrome-512x512.png`,
						type: "image/png",
						sizes: "512x512",
					},
					{
						src: `/assets/icons/monochrome.svg`,
						type: "image/svg+xml",
						sizes: "48x48 72x72 96x96 128x128 256x256",
						purpose: "monochrome",
					},
					{
						src: `/assets/icons/masking-512x512.png`,
						type: "image/png",
						sizes: "512x512",
						purpose: "maskable",
					},
				],
				//TODO: add shortcuts relating to your last opened direct messages
				/*shortcuts: [
							{
								"name": "Open Play Later",
								"short_name": "Play Later",
								"description": "View the list of podcasts you saved for later",
								"url": "/play-later?utm_source=homescreen",
								"icons": [{ "src": "/icons/play-later.png", "sizes": "192x192" }]
							},
							{
								"name": "View Subscriptions",
								"short_name": "Subscriptions",
								"description": "View the list of podcasts you listen to",
								"url": "/subscriptions?utm_source=homescreen",
								"icons": [{ "src": "/icons/subscriptions.png", "sizes": "192x192" }]
							}
						]*/
			},
		}),
		replace({
			__GIT_REVISION__: getGitRevision(),
			__GIT_BRANCH__: getGitBranch(),
			__APP_VERSION__: getVersion(),
			preventAssignment: true,
		}) as any,
	],
	server: {
		port: 7859,
		open: true,
		host: true,
	},
});
