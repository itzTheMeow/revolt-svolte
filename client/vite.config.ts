import replace from "@rollup/plugin-replace";
import { sveltekit } from "@sveltejs/kit/vite";
import { execSync } from "child_process";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			srcDir: "src",
			filename: "sw.ts",
			strategies: "injectManifest",
			manifest: {
				background_color: "#242424",
				description: "A simpler Revolt client.",
				display: "standalone",
				icons: [
					{
						src: "logo.svg",
						sizes: "512x512",
						type: "image/svg+xml",
						purpose: "maskable",
					},
				],
				name: "Svolte",
				short_name: "Svolte",
				start_url: "/",
				theme_color: "#242424",
				orientation: "portrait",
			},
		}),
		replace({
			"%CommitHash%": execSync("git rev-parse --short HEAD").toString().trim(),
			preventAssignment: true,
		}) as any,
	],
	server: {
		port: 7859,
		open: true,
		host: true,
	},
});
