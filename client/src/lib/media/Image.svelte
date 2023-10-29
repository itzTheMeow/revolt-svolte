<script lang="ts">
	import Loader from "../Loader.svelte";
	import { mediaContext, showOptionContext } from "../contextmenu/ContextMenus";
	import { imagePreview } from "../modals/ImagePreview";

	export let src: string;
	export let className = "";
	export let square = false;
	export let alt = "";
	export let width = 0;
	export let height = 0;

	let loaded = false,
		element: HTMLImageElement;

	function click() {
		imagePreview.set({ url: src, metadata: { width, height, type: "Image" } });
	}
</script>

<img
	class="{!square ? 'rounded' : 'object-contain'} cursor-pointer {className}"
	style:display={loaded ? "unset" : "none"}
	{src}
	alt={alt || src.split("/").pop() || "Image"}
	on:load={() => {
		loaded = true;
		if (!width) width = element.width;
		if (!height) height = element.height;
	}}
	bind:this={element}
	data-clickable={typeof src !== "string"}
	on:click={click}
	on:contextmenu|stopPropagation|preventDefault={(e) => showOptionContext(e, mediaContext(src))}
/>
{#if !loaded}
	<div
		class="rounded cursor-pointer bg-black bg-opacity-30 flex items-center justify-center {className}"
		style:aspect-ratio={width + height ? `${width} / ${height}` : ""}
		style:height="{height}px"
		data-clickable
		on:click={click}
	>
		<Loader />
	</div>
{/if}
