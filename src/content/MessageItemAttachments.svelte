<script lang="ts">
  import { client } from "Client";
  import Video from "media/Video.svelte";
  import type { Message } from "revolt.js";
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
        src={proxyURL(client.generateFileURL(attachment), "image")}
        alt={attachment.filename}
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
      <audio class="block" src={proxyURL(client.generateFileURL(attachment), "any")} controls />
    {:else}
      <a href={client.generateFileURL(attachment)} target="_blank">
        Download {attachment.filename}
      </a>
    {/if}
  </div>
{/each}
