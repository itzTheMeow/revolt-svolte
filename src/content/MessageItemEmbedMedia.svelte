<script lang="ts">
  import Image from "media/Image.svelte";
  import Video from "media/Video.svelte";
  import type { EmbedWeb } from "revkit";

  export let embed: EmbedWeb;
  export let height: number;
</script>

{#if embed.special?.type == "YouTube"}
  <iframe
    loading="lazy"
    src={`https://www.youtube-nocookie.com/embed/${embed.special.id}?modestbranding=1${
      embed.special.timestamp ? `&start=${embed.special.timestamp}` : ""
    }`}
    allowFullScreen
    style:height="{height}px"
  />
{:else if embed.special?.type == "Twitch"}
  <iframe
    src="https://player.twitch.tv/?{embed.special.content_type.toLowerCase()}={embed.special
      .id}&parent={window.location.hostname}&autoplay=false"
    frameBorder="0"
    allowFullScreen
    scrolling="no"
    loading="lazy"
    style:height="{height}px"
  />
  <!--
        case "Lightspeed":
            return (
                <iframe
                    src={`https://new.lightspeed.tv/embed/${embed.special.id}/stream`}
                    frameBorder="0"
                    allowFullScreen
                    scrolling="no"
                    loading="lazy"
                    style={{ height }}
                />
            );
        case "Spotify":
            return (
                <iframe
                    src={`https://open.spotify.com/embed/${embed.special.content_type}/${embed.special.id}`}
                    loading="lazy"
                    frameBorder="0"
                    allowFullScreen
                    allowTransparency
                    style={{ height }}
                />
            );
        case "Soundcloud":
            return (
                <iframe
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                        embed.url!,
                    )}&color=%23FF7F50&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                    frameBorder="0"
                    scrolling="no"
                    loading="lazy"
                    style={{ height }}
                />
            );
        case "Bandcamp": {
            return (
                <iframe
                    src={`https://bandcamp.com/EmbeddedPlayer/${embed.special.content_type.toLowerCase()}=${
                        embed.special.id
                    }/size=large/bgcol=181a1b/linkcol=056cc4/tracklist=false/transparent=true/`}
                    seamless
                    loading="lazy"
                    style={{ height }}
                />
            );
        }
        -->
{:else if embed.media?.type == "Video"}
  <Video src={embed.media.url} />
{:else if embed.media?.type == "Image"}
  <Image
    src={embed.media.proxyURL}
    width={embed.media.width}
    height={embed.media.height}
    className="max-w-[480px]"
  />
{/if}

<style>
  iframe {
    width: 100%;
    max-width: 40vw;
    max-height: 50vh;
    border-radius: 0.25rem;
  }
</style>
