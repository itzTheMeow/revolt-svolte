<script lang="ts">
  import {
    IconLayoutSidebarRightCollapse,
    IconLayoutSidebarRightExpand,
  } from "@tabler/icons-svelte";
  import ChannelIcon from "channels/ChannelIcon.svelte";
  import { UseTypingState } from "Client";
  import { channelContext, showOptionContext } from "contextmenu/ContextMenus";
  import Markdown from "markdown/Markdown.svelte";
  import { ModalStack } from "modals/ModalStack";
  import type { BaseMessage, Channel } from "revolt-toolset";
  import {
    MembersCollapsed,
    MessageOffset,
    MessageState,
    MobileLayout,
    SelectedChannel,
  } from "State";
  import { onDestroy, onMount } from "svelte";
  import { Theme } from "Theme";
  import MessageItem from "./MessageItem.svelte";
  import Textbox from "./Textbox.svelte";

  export let channel: Channel;

  let messages: BaseMessage[] = [],
    messageIndex = 0,
    useMessages: BaseMessage[] = [];
  $: {
    $MessageState;
    messages = channel.messages.ordered.reverse();
    messageIndex = (
      channel.messages.get($MessageOffset)
        ? messages.map((m) => m.id)
        : [...messages.map((m) => m.id), $MessageOffset].sort((i1, i2) => (i2 > i1 ? 1 : 0))
    ).indexOf($MessageOffset);
    useMessages = messages.slice(messageIndex, messageIndex + 50);
    console.log(messageIndex);
  }

  let MessageList: HTMLDivElement,
    i: NodeJS.Timer,
    fetching = false;

  onMount(() => {
    i = setInterval(async () => {
      if (-(MessageList.scrollHeight - MessageList.offsetHeight) >= MessageList.scrollTop - 30) {
        const first = useMessages[useMessages.length - 1];
        if (!first) return;
        MessageOffset.set(first.id);
        if (fetching) return;
        fetching = true;
        await channel.messages.fetchMultiple({
          limit: 100,
          before: first.id,
        });
        MessageOffset.set(useMessages.slice(-25)[0].id);
        if (messages.length) fetching = false;
      }
    }, 3);
  });
  onDestroy(() => clearInterval(i));
</script>

<div
  class="h-10 flex items-center px-3 {channel.description ? 'cursor-pointer' : ''}"
  style:background={$Theme["secondary-background"]}
  on:click={() =>
    channel.description &&
    ModalStack.push({
      type: "markdown",
      title: channel.name,
      content: channel.description,
    })}
  on:contextmenu={(e) => showOptionContext(e, channelContext(channel))}
>
  <ChannelIcon {channel} />
  <div class="text-lg ml-1 pointer-events-none">{channel.name}</div>
  {#if channel.description}
    <div class="text-lg opacity-30 ml-2 pointer-events-none">&bull;</div>
    <div class="mx-2 text-sm flex-1 overflow-hidden pointer-events-none">
      <Markdown text={channel.description} line />
    </div>
  {/if}
  {#if !$MobileLayout}
    <div
      class="ml-auto hover:brightness-75 cursor-pointer"
      on:click={() => ($MembersCollapsed = !$MembersCollapsed)}
      style:color={$Theme["secondary-foreground"]}
    >
      {#if $MembersCollapsed}
        <IconLayoutSidebarRightExpand size={20} />
      {:else}
        <IconLayoutSidebarRightCollapse size={20} />
      {/if}
    </div>
  {/if}
</div>
<div
  class="overflow-y-auto flex-1 p-1.5 pb-1 flex flex-col-reverse"
  style:padding-bottom={$UseTypingState && $SelectedChannel?.typing?.length ? "" : "1.75rem"}
  id="MessageList"
  bind:this={MessageList}
>
  <div class="flex flex-col-reverse">
    {#if useMessages.length}
      {#each useMessages as message (message.id)}
        <MessageItem {message} />
      {/each}
    {:else}
      ...
    {/if}
  </div>
</div>
<Textbox />
