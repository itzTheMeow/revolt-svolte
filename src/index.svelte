<script lang="ts">
  import ChannelList from "channels/ChannelList.svelte";
  import { client, ClientReady } from "Client";
  import ContentList from "content/ContentList.svelte";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
  import {
    AppHeight,
    AppWidth,
    HoveredMessage,
    MessageCache,
    MessageInputSelected,
    MobileLayout,
    NotifSettings,
    PaneLeft,
    PaneState,
    PaneStates,
    pendBottom,
    pushFile,
    pushMessages,
    selectBottom,
    selectInput,
    updatePaneState,
  } from "State";
  import { afterUpdate, onMount } from "svelte";
  import { Theme } from "Theme";
  import { disableBodyScroll } from "body-scroll-lock";
  import MemberBar from "memberbar/MemberBar.svelte";
  import TWEEN from "@tweenjs/tween.js";
  import { ElectronFullscreen, Native } from "Native";
  import { Maximize, Minimize, Minus, X } from "tabler-icons-svelte";
  import Unreads from "revolt.js/dist/util/Unreads";
  import ContextMenu from "contextmenu/ContextMenu.svelte";

  requestAnimationFrame(function animate(time: number) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
  });
  client.on("message", async (message) => {
    if ($MessageCache[message.channel_id]) pushMessages(message.channel!, [message]);
    if (message.author_id == client.user?._id) {
      client.unreads?.markRead(message.channel_id, message._id);
      const unreads = new Unreads(client);
      await unreads.sync();
      if ((unreads.getUnread(message.channel_id)?.last_id ?? "0").localeCompare(message._id) === -1)
        message.channel?.ack(message, true);
    }
  });
  window.addEventListener("touchstart", (e) => {
    if (!$HoveredMessage) return;
    const target = e.target as HTMLElement;
    if ([...document.querySelectorAll("[data-hover-item]")].find((i) => i.contains(target))) return;
    HoveredMessage.set(null);
  });
  document.addEventListener("paste", (e) => {
    [...(e.clipboardData?.items || [])].forEach((item) => {
      if (item.kind === "file") {
        const blob = item.getAsFile();
        if (blob) {
          pushFile(blob);
          selectBottom();
        }
      }
    });
  });

  let previous = "";
  afterUpdate(() => {
    let focused = false;
    if ($pendBottom) {
      const ListMessages = document.getElementById("MessageList");
      if (ListMessages) ListMessages.scrollTop = ListMessages.scrollHeight * 2;
      $pendBottom = false;
      if ($selectInput) {
        $selectInput.focus();
        selectInput.set(null);
        focused = true;
      }
    }
    if (previous == document.body.innerHTML) return;
    previous = document.body.innerHTML;
    document
      .querySelectorAll(".overflow-y-auto")
      .forEach((e) => e && disableBodyScroll(e, { allowTouchMove: () => true }));
    if ($selectInput && !focused) {
      $selectInput.focus();
      selectInput.set(null);
      focused = true;
    }
  });

  $: {
    document.body.style.backgroundColor = $Theme["primary-background"]!;
    document.body.style.width = `${$AppWidth}px`;
    document.body.style.height = `${$AppHeight}px`;
  }
  AppHeight.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));
  AppWidth.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));

  let Container: HTMLDivElement;
  onMount(() => {
    updatePaneState($PaneState);
    let startedDragging: [number, number, number] | null = null;
    let curPos: [number, number] | null = null;
    let isSliding = false;
    Container.addEventListener("touchstart", (e) => {
      isSliding = false;
      if (
        document.activeElement?.tagName == "INPUT" &&
        (e.changedTouches[0].target as HTMLElement).tagName == "INPUT"
      )
        return;
      startedDragging = [e.changedTouches[0].pageX, e.changedTouches[0].pageY, Number($PaneLeft)];
    });
    Container.addEventListener("touchmove", (e) => {
      if (!startedDragging) return;
      if (
        document.activeElement?.tagName == "INPUT" &&
        (e.changedTouches[0].target as HTMLElement).tagName == "INPUT"
      )
        return;
      curPos = [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
      if (
        Math.abs(curPos[1] - startedDragging[1]) <= 15 &&
        ((($PaneState == PaneStates.RIGHT || $PaneState == PaneStates.MIDDLE) &&
          curPos[0] - startedDragging[0] >= 20) ||
          (($PaneState == PaneStates.LEFT || $PaneState == PaneStates.MIDDLE) &&
            startedDragging[0] - curPos[0] >= 20))
      )
        isSliding = true;
      if (isSliding) {
        const membar = -(document.getElementById("MemberBar")?.offsetWidth || 0);
        let left = startedDragging[2] + (curPos[0] - startedDragging[0]);
        if ($PaneState == PaneStates.LEFT && left < 0) left = 0;
        else if (left < membar) left = membar;
        PaneLeft.set(left);
        e.preventDefault();
        return false;
      }
    });
    Container.addEventListener("touchend", () => {
      if (isSliding) {
        if ($PaneState == PaneStates.LEFT) {
          PaneState.set(
            updatePaneState(
              $PaneLeft <= window.innerWidth / 2 ? PaneStates.MIDDLE : PaneStates.LEFT
            )
          );
        } else if ($PaneState == PaneStates.MIDDLE) {
          PaneState.set(
            updatePaneState(
              $PaneLeft >= window.innerWidth / 4
                ? PaneStates.LEFT
                : $PaneLeft <= -(window.innerWidth / 3)
                ? PaneStates.RIGHT
                : PaneStates.MIDDLE
            )
          );
        } else if ($PaneState == PaneStates.RIGHT) {
          PaneState.set(
            updatePaneState(
              $PaneLeft <= window.innerWidth / 2 ? PaneStates.MIDDLE : PaneStates.RIGHT
            )
          );
        }
      }
      startedDragging = curPos = null;
      isSliding = false;
    });
  });
</script>

{#if Native.isNative}
  <div
    class="w-full flex items-center pl-2 bg-inherit"
    style="height:{Native.titlebarHeight}px;border-bottom:1px solid rgba(0,0,0,0.2);"
  >
    <div class="flex-1" style="-webkit-app-region:drag;">
      <div class="font-semibold">Svolte</div>
    </div>
    <div
      class="cursor-pointer hover:brightness-75 bg-inherit active:brightness-50 rounded-none h-full flex items-center justify-center"
      style="width:{Native.titlebarHeight * 1.5}px;"
      on:click={Native.min}
    >
      <Minus size={Native.titlebarHeight - 10} />
    </div>
    <div
      class="cursor-pointer hover:brightness-75 bg-inherit active:brightness-50 rounded-none h-full flex items-center justify-center"
      style="width:{Native.titlebarHeight * 1.5}px;"
      on:click={Native.max}
    >
      {#if $ElectronFullscreen}
        <Minimize size={Native.titlebarHeight - 10} />
      {:else}
        <Maximize size={Native.titlebarHeight - 12} />
      {/if}
    </div>
    <div
      class="cursor-pointer hover:bg-error transition-colors active:brightness-75 rounded-none h-full flex items-center justify-center"
      style="width:{Native.titlebarHeight * 1.5}px;"
      on:click={Native.close}
    >
      <X size={Native.titlebarHeight - 8} />
    </div>
  </div>
{/if}
<div
  class="flex relative"
  style="height:{$AppHeight -
    ($MobileLayout && !$MessageInputSelected ? 26 : 0) -
    (Native.isNative ? Native.titlebarHeight : 0)}px;width:{$AppWidth}px;"
  bind:this={Container}
>
  {#if !$ClientReady}
    <div class="m-auto">
      <Loader />
    </div>
  {:else}
    {#if !$MobileLayout || $PaneState !== PaneStates.RIGHT}
      <ServerList />
      <ChannelList />
    {/if}
    <ContentList />
    {#if !$MobileLayout || $PaneState !== PaneStates.LEFT}
      <MemberBar />
    {/if}
  {/if}

  <ContextMenu />
</div>
