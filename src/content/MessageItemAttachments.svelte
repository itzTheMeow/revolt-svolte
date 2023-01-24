<script lang="ts">
  import Audio from "media/Audio.svelte";
  import Image from "media/Image.svelte";
  import Video from "media/Video.svelte";
  import { Attachment, type EmbedMedia, type Message } from "revolt-toolset";

  export let message: Message;

  let attachments: (Attachment | EmbedMedia)[] = [];
  $: attachments = [
    ...(message.attachments || []),
    ...(<EmbedMedia[]>message.embeds.filter((e) => e.isMedia())),
  ];
</script>

{#each attachments as attachment (attachment instanceof Attachment ? attachment.id : `${attachment.width}x${attachment.height}x${attachment.size + attachment.type}`)}
  <div class="rounded mt-1 block" style="max-width:90%;max-height:50vh;">
    {#if (attachment instanceof Attachment ? attachment.metadata.type : attachment.type) == "Image"}
      <Image
        className="max-w-[inherit] max-h-[inherit]"
        src={attachment instanceof Attachment ? attachment : attachment.url}
        width={attachment instanceof Attachment ? 0 : attachment.width}
        height={attachment instanceof Attachment ? 0 : attachment.height}
      />
    {:else if (attachment instanceof Attachment ? attachment.metadata.type : attachment.type) == "Video"}
      <Video
        src={attachment instanceof Attachment ? attachment : attachment.url}
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
{/each}
