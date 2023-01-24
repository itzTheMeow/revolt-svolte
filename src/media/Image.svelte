<script lang="ts">
  import Loader from "Loader.svelte";
  import { imagePreview } from "modals/ImagePreview";
  import type { Attachment } from "revolt-toolset";
  import { proxyURL } from "utils";

  export let src: Attachment | string;
  export let className = "";
  export let square = false;
  export let alt = "";

  let loaded = false;
</script>

<img
  class="{!square ? 'rounded' : ''} {typeof src == 'string' ? '' : 'cursor-pointer'} {className}"
  style:display={loaded ? "unset" : "none"}
  style:aspect-ratio={typeof src !== "string" && src.metadata.type == "Image"
    ? `${src.metadata.width} / ${src.metadata.height}`
    : ""}
  src={typeof src == "string" ? src : proxyURL(src.generateURL(), "image")}
  alt={typeof src == "string" ? alt : alt || src.name}
  on:load={() => (loaded = true)}
  data-clickable={typeof src !== "string"}
  on:click={() => typeof src !== "string" && imagePreview.set(src)}
/>
{#if !loaded}
  <div
    class="rounded cursor-pointer bg-black bg-opacity-30 flex items-center justify-center {className}"
    style:aspect-ratio={typeof src !== "string" && src.metadata.type == "Image"
      ? `${src.metadata.width} / ${src.metadata.height}`
      : ""}
    data-clickable
    on:click={() => typeof src !== "string" && imagePreview.set(src)}
  >
    <Loader />
  </div>
{/if}
