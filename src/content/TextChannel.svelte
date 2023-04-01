<script lang="ts">
  import {
    IconLayoutSidebarRightCollapse,
    IconLayoutSidebarRightExpand,
  } from "@tabler/icons-svelte";
  import ChannelIcon from "channels/ChannelIcon.svelte";
  import { UseTypingState } from "Client";
  import { channelContext, showOptionContext } from "contextmenu/ContextMenus";
  import Loader from "Loader.svelte";
  import Markdown from "markdown/Markdown.svelte";
  import { ModalStack } from "modals/ModalStack";
  import type { BaseMessage, Channel } from "revolt-toolset";
  import {
    ChannelTops,
    MembersCollapsed,
    MessageOffset,
    MessageState,
    MobileLayout,
    SelectedChannel,
  } from "State";
  import { onDestroy, onMount, tick } from "svelte";
  import { Theme } from "Theme";
  import { MSG_PER_PAGE, scrollTo } from "utils";
  import MessageItem from "./MessageItem.svelte";
  import Textbox from "./Textbox.svelte";

  export let channel: Channel;

  const barHeight = 40;

  let messages: BaseMessage[] = [],
    messageIndex = 0,
    useMessages: BaseMessage[] = [];
  $: {
    $MessageState;
    // reverse so newest is first
    messages = channel.messages.ordered.reverse();
    messageIndex = (
      channel.messages.get($MessageOffset) // if the offset isnt arbitrary (not a real message)
        ? messages.map((m) => m.id) // we can just get the messages
        : [...messages.map((m) => m.id), $MessageOffset]
    ) // otherwise we need to factor in the arbitrary offset
      .sort((i1, i2) => (i2 > i1 ? 1 : 0)) // sort the message IDs to calculate which message index to use
      .indexOf($MessageOffset);
    // use the messages from the offset (arbitrary offsets will still work)
    useMessages = messages.slice(messageIndex, messageIndex + MSG_PER_PAGE);
  }

  let MessageList: HTMLDivElement,
    i: NodeJS.Timer,
    fetching: 1 | 0 | -1 = 0;

  onMount(() => {
    i = setInterval(async () => {
      if (fetching) return; // don't fire if we are already fetching messages
      // be within 30px of the top of the scroll container
      if (-(MessageList.scrollHeight - MessageList.offsetHeight) >= MessageList.scrollTop - 30) {
        // get the first "reference" message (the message at the top of the scroll container)
        const first = useMessages[useMessages.length - 1];
        if (first && ChannelTops[channel.id] == first.id) return; // there's no messages in the channel
        fetching = 1; // block future fetches
        const fetched = await channel.messages.fetchMultiple({
          limit: MSG_PER_PAGE,
          include_users: true,
          ...(first ? { before: first.id } : {}),
        });
        // add an offset so there's still messages below the reference (1/4 of the total per page)
        const newOff = useMessages.slice(first ? -Math.round(MSG_PER_PAGE / 4) : 0)[0]?.id;
        if (newOff) MessageOffset.set(newOff);
        await tick(); // wait for DOM update
        if (first) {
          if (MessageList) {
            // scroll the message list back to the reference message
            scrollTo((document.getElementById(first.id)?.offsetTop || 0) - barHeight, true);
          }
          // mark the channel as done
          if (!fetched.length) ChannelTops[channel.id] = first.id;
        } else {
          scrollTo("bottom", true);
        }
        fetching = 0;
      }
    }, 3);
  });
  onDestroy(() => clearInterval(i));
</script>

<div
  class="flex items-center px-3 {channel.description ? 'cursor-pointer' : ''}"
  style:background={$Theme["secondary-background"]}
  style:height="{barHeight}px"
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
  class="overflow-y-auto flex-1 p-1.5 pb-1 flex flex-col-reverse {fetching !== 1 ? 'pt-8' : ''}"
  style:padding-bottom={$UseTypingState && $SelectedChannel?.typing?.length ? "" : "1.75rem"}
  id="MessageList"
  bind:this={MessageList}
>
  <div class="flex flex-col-reverse">
    {#each useMessages as message (message.id)}
      <MessageItem {message} />
    {/each}
  </div>
  {#if fetching == 1}
    <div class="w-full flex items-center justify-center h-8">
      <Loader size={24} />
    </div>
  {/if}
</div>
<Textbox />
