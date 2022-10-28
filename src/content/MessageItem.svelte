<script lang="ts">
  import { client } from "Client";
  import type { Message } from "revolt.js";
  import {
    HoveredMessage,
    MessageCache,
    MobileLayout,
    selectBottom,
    SelectedChannel,
    SelectedServer,
    updateReplies,
  } from "State";
  import { CornerUpLeft } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { escapeHTML, escapeRegex, Matches, MessageDetails, proxyURL } from "utils";

  export let message: Message;

  let shouldSeparate = true;
  $: {
    const previousMessage =
      $MessageCache[$SelectedChannel!._id]?.[
        $MessageCache[$SelectedChannel!._id]?.indexOf(message) - 1
      ];
    shouldSeparate =
      !previousMessage ||
      previousMessage.author_id !== message.author_id ||
      JSON.stringify(previousMessage.masquerade) !== JSON.stringify(message.masquerade);
  }
</script>

{#if $SelectedChannel}
  <div
    class="relative {shouldSeparate ? 'mt-3' : ''}"
    style={$HoveredMessage == message._id
      ? `background-color:${$Theme["secondary-background"]};`
      : ""}
    on:mouseenter={() => HoveredMessage.set(message._id)}
    on:mousemove={() => HoveredMessage.set(message._id)}
    on:mouseleave={() => HoveredMessage.set(null)}
    on:wheel={() => HoveredMessage.set(message._id)}
    on:click={(e) => {
      if (!$MobileLayout) return;
      HoveredMessage.set(message._id);
      e.preventDefault();
      return false;
    }}
  >
    <div class="flex gap-2">
      {#if shouldSeparate}
        <img
          class="rounded-full h-10 w-10 shrink-0 object-cover"
          src={MessageDetails(message).avatar}
          alt=""
        />
      {:else}
        <div class="h-0.5 w-10 shrink-0" />
      {/if}
      <div class="flex flex-col flex-1">
        {#if shouldSeparate}
          <div class="flex items-center gap-1.5 -mb-0.5" style="line-height:1.1;">
            <div class="font-semibold" style="color:{MessageDetails(message).color || 'inherit'};">
              {MessageDetails(message).name}
            </div>
            {#if message.author?.bot}
              <div
                class="rounded px-1 py-0.5 flex items-center justify-center"
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
              return `<img src="${proxyURL(
                `https://autumn.revolt.chat/emojis/${id}`,
                "image"
              )}" class="inline object-contain ${
                message.content == _ ? "h-12 w-12" : "h-5 w-5"
              } -mx-0.5 align-middle" />`;
            })}
        </div>
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
              <a href={client.generateFileURL(attachment)} target="_blank"
                >Download {attachment.filename}</a
              >
            {/if}
          </div>
        {/each}
      </div>
    </div>
    {#if $HoveredMessage == message._id}
      <div
        class="absolute {$MobileLayout
          ? '-top-6 right-5 h-12'
          : '-top-4 right-3 h-8'} flex rounded-lg"
        data-hover-item
        style="background-color:{$Theme['primary-header']};"
      >
        <div
          class="rounded-lg {$MobileLayout
            ? 'h-12 w-12'
            : 'h-8 w-8'} bg-inherit cursor-pointer flex items-center justify-center hover:brightness-90 active:brightness-75"
          on:click={() => {
            updateReplies(message);
            selectBottom();
          }}
        >
          <CornerUpLeft />
        </div>
      </div>
    {/if}
  </div>
{/if}
