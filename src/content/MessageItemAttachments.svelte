<script lang="ts">
  import { client } from "Client";
  import type { Message } from "revolt.js";
  import { proxyURL } from "utils";

  export let message: Message;
</script>

{#each message.attachments || [] as attachment}
  <div class="rounded mt-1 block" style="max-width:90%;max-height:50vh;">
    {#if attachment.metadata.type == "Image"}
      <img
        class="block rounded"
        style="max-width:inherit;max-height:inherit;aspect-ratio:{attachment.metadata
          .width} / {attachment.metadata.height};"
        src={proxyURL(
          client.generateFileURL(attachment, {
            width: Math.floor(window.innerWidth * 0.9),
          }),
          "image"
        )}
        alt={attachment.filename}
      />
    {:else if attachment.metadata.type == "Video"}
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        class="block rounded"
        style="max-width:inherit;max-height:inherit;aspect-ratio:{attachment.metadata
          .width} / {attachment.metadata.height};"
        src={proxyURL(client.generateFileURL(attachment), "any")}
        alt={attachment.filename}
        controls
      />
    {:else if attachment.metadata.type == "Audio"}
      <audio
        class="block"
        src={proxyURL(client.generateFileURL(attachment), "any")}
        alt={attachment.filename}
        controls
      />
    {:else}
      <a href={client.generateFileURL(attachment)} target="_blank">
        Download {attachment.filename}
      </a>
    {/if}
  </div>
{/each}
