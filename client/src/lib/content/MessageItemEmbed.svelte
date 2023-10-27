<script lang="ts">
	import { Theme } from "$lib/Theme";
	import Markdown from "markdown/Markdown.svelte";
	import { EmbedWeb, type Embed } from "revkit";
	import MessageItemAttachment from "./MessageItemAttachment.svelte";
	import MessageItemEmbedMedia from "./MessageItemEmbedMedia.svelte";

	const MAX_EMBED_WIDTH = 480,
		MAX_EMBED_HEIGHT = 640,
		MAX_PREVIEW_SIZE = 150;

	export let embed: Embed | EmbedWeb;

	let mw = 0,
		mh = 0,
		failLoad = false;
	$: {
		mw = MAX_EMBED_WIDTH;
		mh = MAX_EMBED_HEIGHT;
		if (embed instanceof EmbedWeb) {
			switch (embed.special?.type) {
				case "YouTube":
				case "Bandcamp": {
					mw = embed.media?.width ?? 1280;
					mh = embed.media?.height ?? 720;
					break;
				}
				case "Twitch":
				case "Lightspeed": {
					mw = 1280;
					mh = 720;
					break;
				}
				default: {
					if (embed.media?.type == "Image" && embed.media.size === "Preview") {
						mw = MAX_EMBED_WIDTH;
						mh = Math.min(embed.media.height ?? 0, MAX_PREVIEW_SIZE);
					} else {
						mw = Math.min(embed.media?.width ?? MAX_EMBED_WIDTH, MAX_EMBED_WIDTH);
						mh = embed.media?.height ?? 0;
					}
				}
			}
			mw = mw || MAX_EMBED_WIDTH;
			mh = mh || MAX_EMBED_HEIGHT;
		}
	}
</script>

<div
	class="rounded-lg my-1 p-3 flex flex-col gap-1.5"
	style:border-inline-start="4px solid {embed.color || $Theme["tertiary-background"]}"
	style:background={$Theme["primary-header"]}
	style:max-width="min({mw}px, 95%)"
	style:max-height="90vh"
>
	{#if embed.isWeb() ? embed.siteName : embed.title}
		<div class="flex items-center gap-1">
			{#if embed.iconURL && !failLoad}
				<img class="w-4 h-4" src={embed.proxyIconURL} alt="" on:error={() => (failLoad = true)} />
			{/if}
			<div
				class="text-xs overflow-hidden overflow-ellipsis whitespace-nowrap"
				style:color={$Theme["secondary-foreground"]}
			>
				{embed.isWeb() ? embed.siteName : embed.title}
			</div>
		</div>
	{/if}
	{#if embed.isWeb() && embed.title}
		<a
			class="text-[1.1em] overflow-hidden hover:underline font-medium"
			style:display="-webkit-box"
			style:-webkit-line-clamp="2"
			style:-webkit-box-orient="vertical"
			style:color={$Theme["accent"]}
			href={embed.url}>{embed.title}</a
		>
	{/if}
	{#if embed.description}
		{#if embed.isText()}
			<Markdown text={embed.description} keepSpace />
		{:else}
			<div
				class="text-xs overflow-hidden"
				style:display="-webkit-box"
				style:-webkit-line-clamp="6"
				style:-webkit-box-orient="vertical"
			>
				{embed.description}
			</div>
		{/if}
	{/if}
	{#if embed.isWeb()}
		<MessageItemEmbedMedia {embed} height={mh} />
	{:else if embed.media}
		<MessageItemAttachment attachment={embed.media} inline />
	{/if}
</div>
