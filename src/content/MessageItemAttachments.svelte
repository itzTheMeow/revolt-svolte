<script lang="ts">
  import Audio from "media/Audio.svelte";
  import Image from "media/Image.svelte";
  import Video from "media/Video.svelte";
  import type { Message } from "revolt-toolset";

  export let message: Message;
</script>

{#each message.attachments || [] as attachment (attachment.id)}
  <div class="rounded mt-1 block" style="max-width:90%;max-height:50vh;">
    {#if attachment.metadata.type == "Image"}
      <Image className="max-w-[inherit] max-h-[inherit]" src={attachment} />
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
