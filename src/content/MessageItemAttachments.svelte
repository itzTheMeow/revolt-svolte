<script lang="ts">
  import Audio from "media/Audio.svelte";
  import Video from "media/Video.svelte";
  import type { Message } from "revolt-toolset";
  import { proxyURL } from "utils";
  import { imagePreview } from "../modals/ImagePreview";

  export let message: Message;
</script>

{#each message.attachments || [] as attachment}
  <div class="rounded mt-1 block" style="max-width:90%;max-height:50vh;">
    {#if attachment.metadata.type == "Image"}
      <img
        class="block rounded cursor-pointer"
        style="max-width:inherit;max-height:inherit;aspect-ratio:{attachment.metadata
          .width} / {attachment.metadata.height};"
        src={proxyURL(attachment.generateURL(), "image")}
        alt={attachment.name}
        data-clickable
        on:click={() => imagePreview.set(attachment)}
      />
    {:else if attachment.metadata.type == "Video"}
      <Video
        src={attachment}
        style="max-width:inherit;max-height:inherit;aspect-ratio:{attachment.metadata
          .width} / {attachment.metadata.height};"
      />
    {:else if attachment.metadata.type == "Audio"}
      <Audio src={attachment} />
    {:else}
      <a href={attachment.generateDownloadURL()} target="_blank" rel="noreferrer">
        [Download {attachment.name}]
      </a>
    {/if}
  </div>
{/each}
