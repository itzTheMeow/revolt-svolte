<script lang="ts">
  import Audio from "media/Audio.svelte";
  import Image from "media/Image.svelte";
  import Video from "media/Video.svelte";
  import { Attachment, type EmbedMedia } from "revkit";

  export let attachment: Attachment | EmbedMedia;
  export let inline = false;
</script>

<div class="rounded mt-1 block" style="{inline ? '' : 'max-width:90%;'}max-height:50vh;">
  {#if (attachment instanceof Attachment ? attachment.metadata.type : attachment.type) == "Image"}
    <Image
      className="max-w-[inherit] max-h-[inherit]"
      src={attachment instanceof Attachment ? attachment : attachment.proxyURL}
      width={attachment instanceof Attachment ? 0 : attachment.width}
      height={attachment instanceof Attachment ? 0 : attachment.height}
    />
  {:else if (attachment instanceof Attachment ? attachment.metadata.type : attachment.type) == "Video"}
    <Video
      src={attachment instanceof Attachment ? attachment : attachment.proxyURL}
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
