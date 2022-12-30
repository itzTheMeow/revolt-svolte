<script lang="ts">
  import { client } from "Client";
  import { proxyURL } from "utils";
  import { imagePreview } from "./ImagePreview";

  let preview: HTMLDivElement;

  let imageURL: string;
  $: {
    if ($imagePreview) {
      imageURL = proxyURL(client.generateFileURL($imagePreview), "image");
    }
  }
</script>

{#if $imagePreview}
  <div
    class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center"
    on:click={(e) =>
      //@ts-ignore
      !preview.contains(e.target) && imagePreview.set(null)}
  >
    <div class="max-w-[90%] max-h-[90%]" bind:this={preview}>
      <img src={imageURL} alt={$imagePreview.filename} />
    </div>
  </div>
{/if}
