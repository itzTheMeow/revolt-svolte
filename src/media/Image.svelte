<script lang="ts">
  import { mediaContext, showOptionContext } from "contextmenu/ContextMenus";
  import Loader from "Loader.svelte";
  import { imagePreview } from "modals/ImagePreview";
  import type { Attachment } from "revkit";

  export let src: Attachment | string;
  export let className = "";
  export let square = false;
  export let alt = "";
  export let width = 0;
  export let height = 0;

  let loaded = false,
    element: HTMLImageElement;
</script>

<img
  class="{!square ? 'rounded' : 'object-contain'} cursor-pointer {className}"
  style:display={loaded ? "unset" : "none"}
  style:aspect-ratio={typeof src !== "string" && src.metadata.type == "Image"
    ? `${src.metadata.width} / ${src.metadata.height}`
    : width + height
    ? `${width} / ${height}`
    : ""}
  src={typeof src == "string" ? src : src.generateURL()}
  alt={alt || (typeof src == "string" ? src.split("/").pop() || "Image" : src.name)}
  on:load={() => {
    loaded = true;
    if (!width) width = element.width;
    if (!height) height = element.height;
  }}
  bind:this={element}
  data-clickable={typeof src !== "string"}
  on:click={() =>
    imagePreview.set(
      typeof src == "string" ? { url: src, metadata: { width, height, type: "Image" } } : src
    )}
  on:contextmenu|stopPropagation|preventDefault={(e) => showOptionContext(e, mediaContext(src))}
/>
{#if !loaded}
  <div
    class="rounded cursor-pointer bg-black bg-opacity-30 flex items-center justify-center {className}"
    style:aspect-ratio={typeof src !== "string" && src.metadata.type == "Image"
      ? `${src.metadata.width} / ${src.metadata.height}`
      : width + height
      ? `${width} / ${height}`
      : ""}
    data-clickable
    on:click={() => typeof src !== "string" && imagePreview.set(src)}
  >
    <Loader />
  </div>
{/if}
