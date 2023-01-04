<script lang="ts">
  import TWEEN from "@tweenjs/tween.js";
  import { disableBodyScroll } from "body-scroll-lock";
  import ChannelList from "channels/ChannelList.svelte";
  import { client, ClientReady } from "Client";
  import ContentList from "content/ContentList.svelte";
  import ContextMenu from "contextmenu/ContextMenu.svelte";
  import { CMState } from "contextmenu/ContextMenuState";
  import MemberContextMenu from "contextmenu/MemberContextMenu.svelte";
  import Loader from "Loader.svelte";
  import MemberBar from "memberbar/MemberBar.svelte";
  import { imagePreview } from "modals/ImagePreview";
  import ImagePreview from "modals/ImagePreview.svelte";
  import ModalRenderer from "modals/ModalRenderer.svelte";
  import { ModalStack } from "modals/ModalStack";
  import { ElectronFullscreen, Native } from "Native";
  import ServerList from "servers/ServerList.svelte";
  import {
    AppHeight,
    AppWidth,
    fullscreenElement,
    HoveredMessage,
    MessageCache,
    MessageInputSelected,
    MobileLayout,
    PaneLeft,
    PaneState,
    PaneStates,
    pushFile,
    pushMessages,
    selectBottom,
    SelectedChannel,
    SelectedServer,
    selectInput,
    spliceMessages,
    updatePaneState,
  } from "State";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { Maximize, Minimize, Minus, X } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { BRAND_NAME, handleUpdates } from "utils";
  import { MemberMenu, showMemberContext } from "./contextmenu/MemberContextMenu";

  requestAnimationFrame(function animate(time: number) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
  });
  client.users.onUpdate(() => {
    MessageCache.update((c) => c);
  });
  client.servers.onUpdate(() => {
    MessageCache.update((c) => c);
    SelectedServer.update((s) => s);
  });
  client.on("message", async (message) => {
    if ($MessageCache[message.channelID]) pushMessages(message.channel!, [message]);
    if (
      (message.isUser() && message.authorID == client.user.id) ||
      (document.hasFocus() && $SelectedChannel?.id == message.channelID)
    )
      message.channel.markRead(true);
  });
  client.on("messageUpdate", async (message) => {
    if ($MessageCache[message.channelID]) pushMessages(message.channel!, [message]);
  });
  client.on("messageDelete", (_, message) => {
    if (message && $MessageCache[message.channelID]) spliceMessages(message.channel!, [message]);
  });
  const fetching = new Set();
  SelectedChannel.subscribe((c) => {
    if (c?.isTextBased() && !$MessageCache[c.id] && !fetching.has(c.id)) {
      fetching.add(c.id);
      c.messages
        .fetchMultiple({
          limit: 100,
          include_users: true,
        })
        .then((m) => {
          pushMessages(c, m);
          fetching.delete(c);
        });
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
  window.addEventListener("contextmenu", (e) => {
    const target = <HTMLElement>e.target,
      tag = target.tagName;
    if (
      tag == "INPUT" ||
      tag == "TEXTAREA" ||
      (tag == "A" && target.getAttribute("type") == "link")
    )
      return;
    e.preventDefault();
  });
  window.addEventListener("dragstart", (e) => {
    if ((<HTMLElement>e.target).tagName == "IMG") e.preventDefault();
  });
  window.addEventListener("click", async (e) => {
    const target = <HTMLElement>e.target;
    const uid = target.getAttribute("data-userpopup");
    if (uid) {
      try {
        const member = await $SelectedServer?.members.fetch(uid);
        if (member) return showMemberContext(member, e.clientX, e.clientY, target);
      } catch {}
      ModalStack.push({
        type: "user",
        id: uid,
      });
    }
  });
  window.addEventListener("keydown", async (e) => {
    if (e.key == "Escape") {
      if ($CMState) CMState.set(null);
      else if ($MemberMenu) MemberMenu.set(null);
      else if (await ModalStack.top()) ModalStack.close(await ModalStack.top());
      else if ($imagePreview) imagePreview.set(null);
    }
  });
  setInterval(() => {
    if (document.fullscreenElement) {
      if (!$fullscreenElement || !document.fullscreenElement.isEqualNode($fullscreenElement))
        fullscreenElement.set(document.fullscreenElement);
    } else fullscreenElement.set(null);
  }, 10);

  handleUpdates(beforeUpdate, afterUpdate);

  let previous = "";
  afterUpdate(() => {
    let focused = false;
    if ($selectInput) {
      $selectInput.focus();
      selectInput.set(null);
      focused = true;
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
    document.body.style.caretColor = $Theme["accent"]!;
    document.body.style.width = `${$AppWidth}px`;
    document.body.style.height = `${$AppHeight}px`;
    document.body.style.setProperty("--tip", $Theme["tooltip"] ?? null);
  }
  AppHeight.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));
  AppWidth.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));

  let Container: HTMLDivElement;
  onMount(() => {
    updatePaneState($PaneState);
    let startedDragging: [number, number, number] | null = null;
    let curPos: [number, number] | null = null;
    let isSliding = false;
    Container.addEventListener("touchstart", async (e) => {
      isSliding = false;
      const target = e.changedTouches[0].target as HTMLElement;
      if (
        (document.activeElement?.tagName == "INPUT" && target.tagName == "INPUT") ||
        $imagePreview ||
        [...document.querySelectorAll("[data-slider]")].find((s) => s.contains(target)) ||
        (await ModalStack.getStack()).length
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
      if (curPos[1] - 5 > startedDragging[1] || isSliding) selectBottom(true);
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
    class="w-full flex items-center pl-2 bg-inherit select-none"
    style="height:{Native.titlebarHeight}px;border-bottom:1px solid rgba(0,0,0,0.2);"
  >
    <div class="flex-1" style="-webkit-app-region:drag;">
      <div class="font-semibold">{BRAND_NAME}</div>
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
  class="flex relative select-none"
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

  <ImagePreview />
  <ModalRenderer />
  <MemberContextMenu />
  <ContextMenu />
</div>
