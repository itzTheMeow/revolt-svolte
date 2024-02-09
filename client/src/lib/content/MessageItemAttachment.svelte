<script lang="ts">
	import { Attachment, type EmbedMedia } from "revkit";
	import Audio from "../media/Audio.svelte";
	import Image from "../media/Image.svelte";
	import Video from "../media/Video.svelte";

	export let attachment: Attachment | EmbedMedia;
	export let inline = false;

	let data: {
		name: string;
		width: number;
		height: number;
		url: string;
		type: Attachment["metadata"]["type"] | EmbedMedia["type"];
	};
	$: if (attachment instanceof Attachment) {
		data = {
			type: attachment.metadata.type,
			name: attachment.name,
			width: 0,
			height: 0,
			url: attachment.generateURL(),
		};
		if (attachment.metadata.type == "Image" || attachment.metadata.type == "Video") {
			data.width = attachment.metadata.width;
			data.height = attachment.metadata.height;
		}
	} else {
		data = {
			type: attachment.type,
			name: "",
			width: attachment.width,
			height: attachment.height,
			url: attachment.proxyURL,
		};
	}
</script>

<div class="rounded mt-1 block" style="{inline ? '' : 'max-width:90%;'}max-height:50vh;">
	{#if data.type == "Image"}
		<Image
			className="max-w-[inherit] max-h-[inherit]"
			src={data.url}
			width={data.width}
			height={data.height}
			alt={data.name}
		/>
	{:else if data.type == "Video"}
		<Video
			src={attachment instanceof Attachment ? attachment : attachment.proxyURL}
			style="max-width:inherit;max-height:inherit;{attachment instanceof Attachment
				? attachment.metadata.type == 'Video' &&
				  `aspect-ratio:${attachment.metadata.width} / ${attachment.metadata.height};`
				: `aspect-ratio:${attachment.width} / ${attachment.height};`}"
		/>
	{:else if attachment instanceof Attachment && attachment.metadata.type == "Audio"}
		<Audio src={attachment} />
	{:else if attachment instanceof Attachment}
		<a href={attachment.generateDownloadURL()} target="_blank" rel="noreferrer">
			[Download {attachment.name}]
		</a>
	{/if}
</div>
