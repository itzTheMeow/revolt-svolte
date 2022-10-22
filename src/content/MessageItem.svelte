<script lang="ts">
  import { client } from "Client";
  import type { Message } from "revolt.js";
  import { MessageCache, SelectedChannel, SelectedServer } from "State";
  import { Theme } from "Theme";
  import { escapeHTML, escapeRegex, Matches, proxyURL } from "utils";

  export let message: Message;

  let shouldSeparate = true;
  $: {
    const previousMessage =
      $MessageCache[$SelectedChannel!._id][
        $MessageCache[$SelectedChannel!._id].indexOf(message) - 1
      ];
    shouldSeparate =
      !previousMessage ||
      previousMessage.author_id !== message.author_id ||
      JSON.stringify(previousMessage.masquerade) !== JSON.stringify(message.masquerade);
  }
</script>

{#if $SelectedChannel}
  <div>
    {#if shouldSeparate}
      <div class="flex items-center gap-1.5 mt-2">
        <div
          class="font-semibold"
          style="color:{message.masquerade?.colour ||
            message.member?.orderedRoles.find((r) => r[1].colour)?.[1].colour ||
            'inherit'};"
        >
          {message.masquerade?.name || message.member?.nickname || message.author?.username}
        </div>
        {#if message.author?.bot}
          <div
            class="rounded px-0.5"
            style="background-color:{$Theme['accent']};font-size:0.65rem;"
          >
            {message.masquerade ? "BRIDGE" : "BOT"}
          </div>
        {/if}
      </div>
    {/if}
    <div class="whitespace-pre-wrap">
      {@html escapeHTML(message.content || "")
        .replace(escapeRegex(Matches.user), (_, id) => {
          const u = client.users.get(id);
          return `<span style="color:${$Theme["accent"]};">@${escapeHTML(
            u?.username || "Unknown User"
          )}</span>`;
        })
        .replace(escapeRegex(Matches.channel), (_, id) => {
          const c = $SelectedServer?.channels.find((c) => c?._id == id);
          return `<span style="color:${$Theme["accent"]};">#${escapeHTML(
            c?.name || "unknown-channel"
          )}</span>`;
        })
        .replace(escapeRegex(Matches.emojiCustom), (_, id) => {
          const e = client.emojis.get(id);
          if (!e) return _;
          return `<img src="${proxyURL(e.imageURL, "image")}" class="inline object-contain ${
            message.content == _ ? "h-12 w-12" : "h-5 w-5"
          } -mx-0.5 align-middle" />`;
        })}
    </div>
    {#each message.attachments || [] as attachment}
      <div
        class="rounded mt-2 block"
        style="max-width:90vw;{['width', 'height']
          .map(
            (h) =>
              h +
              ':' +
              Math.floor(
                Math.min(
                  1,
                  Math.min(
                    //@ts-ignore
                    (window.innerWidth * 0.9) / attachment.metadata.width,
                    //@ts-ignore
                    (window.innerHeight * 0.7) / attachment.metadata.height
                  )
                ) *
                  //@ts-ignore
                  attachment.metadata[h]
              ) +
              'px'
          )
          .join(';')}"
      >
        {#if attachment.metadata.type == "Image"}
          <img
            class="block rounded"
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
            class="block"
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
          <a href={client.generateFileURL(attachment)} target="_blank"
            >Download {attachment.filename}</a
          >
        {/if}
      </div>
    {/each}
  </div>
{/if}
