<script lang="ts">
  import { client } from "Client";
  import { showMemberContext } from "contextmenu/FloatingMenu";
  import { DateTime } from "luxon";
  import { ModalStack } from "modals/ModalStack";
  import type { BaseMessage, Embed, EmbedWeb } from "revolt-toolset";
  import { HoveredMessage, MessageCache, MobileLayout, selectBottom, SelectedChannel } from "State";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";
  import MessageItemAttachments from "./MessageItemAttachments.svelte";
  import MessageItemContent from "./MessageItemContent.svelte";
  import MessageItemEmbed from "./MessageItemEmbed.svelte";
  import MessageItemHeader from "./MessageItemHeader.svelte";
  import MessageItemReplies from "./MessageItemReplies.svelte";
  import MessageItemToolbar from "./MessageItemToolbar.svelte";

  export let message: BaseMessage;

  let isReply = false,
    shouldSeparate = true,
    isHovered = false,
    doHighlight = false,
    embeds: (Embed | EmbedWeb)[] = [];
  $: {
    const previousMessage =
      $MessageCache[$SelectedChannel!.id]?.[
        $MessageCache[$SelectedChannel!.id]?.indexOf(message) - 1
      ];
    isReply = message.isUser() && !!message.replies.length;
    shouldSeparate =
      !message.isUser() ||
      isReply ||
      !previousMessage ||
      !previousMessage.isUser() ||
      previousMessage.authorID !== message.authorID ||
      JSON.stringify(previousMessage.masquerade) !== JSON.stringify(message.masquerade) ||
      Math.abs(previousMessage.createdAt - message.createdAt) >= 420000;
    isHovered = $HoveredMessage == message.id;
    doHighlight = message.isUser() && message.mentionIDs.includes(client.user.id);
    embeds = message.isUser() ? <any>message.embeds.filter((e) => e.isText() || e.isWeb()) : [];
  }

  let startScroll: number | null = null;
  function handleClickDown(e: TouchEvent) {
    const list = document.getElementById("MessageList");
    startScroll = list?.scrollTop ?? null;
  }
  function handleClick(e: TouchEvent | MouseEvent) {
    const target = e.target as HTMLElement;
    if (!$MobileLayout || !e.isTrusted) return (startScroll = null);
    if (
      target.tagName == "A" ||
      [...document.querySelectorAll("[data-clickable]")].find((c) => c.contains(target))
    ) {
      if (document.activeElement?.id == "Textbox") {
        e.preventDefault();
        target.click();
        selectBottom(true);
      }
      startScroll = null;
      return;
    }
    const list = document.getElementById("MessageList")!;
    if (startScroll === null || Math.abs(startScroll - list.scrollTop) <= 1)
      HoveredMessage.set(message.id);
    startScroll = null;
  }
</script>

{#if $SelectedChannel}
  <div class="flex flex-col gap-0.5">
    {#if isReply && message.isUser()}
      <MessageItemReplies {message} />
    {/if}
    <div
      class="relative px-1 [line-height:normal] {shouldSeparate ? 'mt-3' : ''}"
      style:background-color={isHovered
        ? $Theme["secondary-background"]
        : doHighlight
        ? $Theme["mention"]
        : ""}
      on:mouseenter={() => !$MobileLayout && HoveredMessage.set(message.id)}
      on:mousemove={() => !$MobileLayout && HoveredMessage.set(message.id)}
      on:mouseleave={() => !$MobileLayout && HoveredMessage.set(null)}
      on:wheel={() => !$MobileLayout && HoveredMessage.set(message.id)}
      on:touchstart={handleClickDown}
      on:touchend={handleClick}
    >
      {#if message.isUser()}
        <div class="flex gap-2 {shouldSeparate ? '' : 'items-center'}">
          {#if shouldSeparate}
            <img
              class="rounded-full h-10 w-10 shrink-0 object-cover cursor-pointer"
              src={MessageDetails(message).avatar}
              alt=""
              data-clickable
              on:click={(e) => {
                if (!message.isUser()) return;
                if (message.member)
                  showMemberContext(message.member, e.clientX, e.clientY, e.target);
                else ModalStack.push({ type: "user", id: message.authorID });
              }}
            />
          {:else}
            <div
              class="h-full w-10 shrink-0 text-center overflow-hidden whitespace-nowrap"
              style:font-size="0.65rem"
              style:color={$Theme["tertiary-foreground"]}
            >
              {#if isHovered}
                {DateTime.fromMillis(message.createdAt).toFormat("t")}
              {:else if message.edited}
                (edited)
              {/if}
            </div>
          {/if}
          <div
            class="flex flex-col flex-1 max-w-[calc(100%-3rem)] py-0.5 {!$MobileLayout
              ? 'select-text'
              : ''}"
          >
            {#if shouldSeparate}
              <MessageItemHeader {message} />
            {/if}
            {#if message.content}
              <MessageItemContent {message} />
            {/if}
            {#if message.attachments?.length || message.embeds.filter((e) => e.isMedia()).length}
              <MessageItemAttachments {message} />
            {/if}
            {#each embeds as embed}
              <MessageItemEmbed {embed} />
            {/each}
          </div>
        </div>
      {/if}
      {#if isHovered}
        <MessageItemToolbar {message} />
      {/if}
    </div>
  </div>
{/if}
