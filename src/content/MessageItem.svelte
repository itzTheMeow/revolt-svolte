<script lang="ts">
  import type { Message } from "revolt.js";
  import { HoveredMessage, MessageCache, MobileLayout, SelectedChannel } from "State";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";
  import MessageItemAttachments from "./MessageItemAttachments.svelte";
  import MessageItemContent from "./MessageItemContent.svelte";
  import MessageItemHeader from "./MessageItemHeader.svelte";
  import MessageItemToolbar from "./MessageItemToolbar.svelte";

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
          <MessageItemHeader {message} />
        {/if}
        <MessageItemContent {message} />
        <MessageItemAttachments {message} />
      </div>
    </div>
    {#if $HoveredMessage == message._id}
      <MessageItemToolbar {message} />
    {/if}
  </div>
{/if}
