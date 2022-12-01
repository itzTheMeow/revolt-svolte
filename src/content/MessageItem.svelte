<script lang="ts">
  import { DateTime } from "luxon";
  import type { Message } from "revolt.js";
  import { HoveredMessage, MessageCache, MobileLayout, SelectedChannel } from "State";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";
  import MessageItemAttachments from "./MessageItemAttachments.svelte";
  import MessageItemContent from "./MessageItemContent.svelte";
  import MessageItemHeader from "./MessageItemHeader.svelte";
  import MessageItemReplies from "./MessageItemReplies.svelte";
  import MessageItemToolbar from "./MessageItemToolbar.svelte";

  export let message: Message;

  let isReply = false,
    shouldSeparate = true,
    isHovered = false;
  $: {
    const previousMessage =
      $MessageCache[$SelectedChannel!._id]?.[
        $MessageCache[$SelectedChannel!._id]?.indexOf(message) - 1
      ];
    isReply = !!message.reply_ids?.length;
    shouldSeparate =
      isReply ||
      !previousMessage ||
      previousMessage.author_id !== message.author_id ||
      JSON.stringify(previousMessage.masquerade) !== JSON.stringify(message.masquerade) ||
      Math.abs(previousMessage.createdAt - message.createdAt) >= 420000;
    isHovered = $HoveredMessage == message._id;
  }
</script>

{#if $SelectedChannel}
  {#if isReply}
    <MessageItemReplies {message} />
  {/if}
  <div
    class="relative {shouldSeparate ? 'mt-3' : ''}"
    style={isHovered ? `background-color:${$Theme["secondary-background"]};` : ""}
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
    <div class="flex gap-2 {shouldSeparate ? '' : 'items-center'}">
      {#if shouldSeparate}
        <img
          class="rounded-full h-10 w-10 shrink-0 object-cover"
          src={MessageDetails(message).avatar}
          alt=""
        />
      {:else}
        <div
          class="h-full w-10 shrink-0 text-center overflow-hidden whitespace-nowrap"
          style:font-size="0.65rem"
          style:color={$Theme["tertiary-foreground"]}
        >
          {#if isHovered}
            {DateTime.fromMillis(message.createdAt).toFormat("t")}
          {/if}
        </div>
      {/if}
      <div class="flex flex-col flex-1">
        {#if shouldSeparate}
          <MessageItemHeader {message} />
        {/if}
        <MessageItemContent {message} />
        <MessageItemAttachments {message} />
      </div>
    </div>
    {#if isHovered}
      <MessageItemToolbar {message} />
    {/if}
  </div>
{/if}
