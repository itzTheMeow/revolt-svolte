<script lang="ts">
  import Loader from "Loader.svelte";
  import { imagePreview } from "modals/ImagePreview";
  import type { Attachment } from "revolt-toolset";
  import { proxyURL } from "utils";

  export let src: Attachment;
  export let className = "";
  let loaded = false;
</script>

{#if src.metadata.type == "Image"}
  <img
    class="rounded cursor-pointer {className}"
    style:display={loaded ? "unset" : "none"}
    style:aspect-ratio="{src.metadata.width} / {src.metadata.height}"
    src={proxyURL(src.generateURL(), "image")}
    alt={src.name}
    on:load={() => (loaded = true)}
    data-clickable
    on:click={() => imagePreview.set(src)}
  />
  {#if !loaded}
    <div
      class="rounded cursor-pointer bg-black bg-opacity-30 flex items-center justify-center {className}"
      style:aspect-ratio="{src.metadata.width} / {src.metadata.height}"
      data-clickable
      on:click={() => imagePreview.set(src)}
    >
      <Loader />
    </div>
  {/if}
{/if}
