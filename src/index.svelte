<script lang="ts">
  import TWEEN from "@tweenjs/tween.js";
  import { disableBodyScroll } from "body-scroll-lock";
  import ChannelList from "channels/ChannelList.svelte";
  import { client, ClientReady, UseUserState } from "Client";
  import ContentList from "content/ContentList.svelte";
  import ContextMenu from "contextmenu/ContextMenu.svelte";
  import { CMState } from "contextmenu/ContextMenuState";
  import { floatingMenu, showMemberContext } from "contextmenu/FloatingMenu";
  import FloatingMenu from "contextmenu/FloatingMenu.svelte";
  import Titlebar from "extra/Titlebar.svelte";
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
    isEditing,
    MembersCollapsed,
    MessageInputSelected,
    MessageState,
    MobileLayout,
    NotifSettings,
    PaneLeft,
    PaneState,
    PaneStates,
    pushFile,
    replyingTo,
    selectBottom,
    SelectedChannel,
    SelectedServer,
    selectInput,
    updatePaneState,
    uploadedFiles,
  } from "State";
  import { afterUpdate, onMount } from "svelte";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";
  import { hasBottom, scrollTo, testMuted } from "utils";

  onMount(() => {
    requestAnimationFrame(function animate(time: number) {
      requestAnimationFrame(animate);
      TWEEN.update(time);
    });
    client.users.onUpdate(() => {
      MessageState.set(Date.now());
      UseUserState.set(Date.now() * Math.random());
    });
    client.servers.onUpdate(() => {
      MessageState.set(Date.now());
      SelectedServer.update((s) => s);
    });
    client.on("message", async (message) => {
      const b = hasBottom();
      MessageState.set(Date.now());
      //if ($SelectedChannel?.id == message.channelID && b) setTimeout(() => addScroll(99999), 50);
      if (
        (message.isUser() && message.authorID == client.user.id) ||
        (document.hasFocus() && $SelectedChannel?.id == message.channelID)
      )
        message.channel.markRead(true);
    });
    client.on("messageUpdate", async (message) => {
      MessageState.set(Date.now());
    });
    client.on("messageDelete", (id, message) => {
      MessageState.set(Date.now());
      if ($isEditing == id) isEditing.set(null);
    });
    const fetching = new Set();
    SelectedChannel.subscribe((c) => {
      if (c?.isTextBased() && !c.messages.size && !fetching.has(c.id)) {
        fetching.add(c.id);
        c.messages
          .fetchMultiple({
            limit: 100,
            include_users: true,
          })
          .then((m) => {
            MessageState.set(Date.now());
            fetching.delete(c);
          });
      }
    });
    window.addEventListener("touchstart", (e) => {
      if (!$HoveredMessage) return;
      const target = e.target as HTMLElement;
      if ([...document.querySelectorAll("[data-hover-item]")].find((i) => i.contains(target)))
        return;
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
    window.addEventListener("dblclick", async (e) => {
      const target = <HTMLElement>e.target;
      const uid = target.getAttribute("data-userpopup");
      if (uid) {
        if ($floatingMenu) floatingMenu.set(null);
        ModalStack.push({
          type: "user",
          id: uid,
        });
        window.getSelection()?.removeAllRanges();
      }
    });
    window.addEventListener("keydown", async (e) => {
      if (
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !$MobileLayout &&
        (!e.ctrlKey ||
          !window.getSelection()?.rangeCount ||
          (window.getSelection()?.getRangeAt(0)?.startOffset ==
            window.getSelection()?.getRangeAt(0)?.endOffset &&
            window.getSelection()?.getRangeAt(0)?.startContainer ==
              window.getSelection()?.getRangeAt(0)?.endContainer))
      )
        document.getElementById("Textbox")?.focus();
      if (e.key == "Escape") {
        if ($CMState) CMState.set(null);
        else if ($floatingMenu) floatingMenu.set(null);
        else if (await ModalStack.top()) ModalStack.close(await ModalStack.top());
        else if ($imagePreview) imagePreview.set(null);
        else if ($isEditing) isEditing.set(null);
        else if ($replyingTo.length) $replyingTo = $replyingTo.slice(1);
        else if ($uploadedFiles.length) $uploadedFiles = $uploadedFiles.slice(1);
        else {
          if ($SelectedChannel?.checkUnread(testMuted($NotifSettings)))
            $SelectedChannel.markRead(true);
          scrollTo("bottom", true);
        }
      }
    });
    setInterval(() => {
      if (document.fullscreenElement) {
        if (!$fullscreenElement || !document.fullscreenElement.isEqualNode($fullscreenElement))
          fullscreenElement.set(document.fullscreenElement);
      } else fullscreenElement.set(null);
    }, 10);
  });

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
    Object.entries($Theme).forEach((e) => {
      document.body.style.setProperty("--" + e[0], e[1] ?? null);
    });
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", $Theme["primary-background"]!);
  }
  AppHeight.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));
  AppWidth.subscribe(async () => ElectronFullscreen.set(await Native.isMaximized()));

  let Container: HTMLDivElement;
  onMount(() => {
    updatePaneState($PaneState, false);
    let startedDragging: [number, number, number] | null = null;
    let curPos: [number, number] | null = null;
    let isSliding = false;
    Container.addEventListener("touchstart", async (e) => {
      isSliding = false;
      const target = e.changedTouches[0].target as HTMLElement;
      if (
        (document.activeElement?.tagName == "TEXTAREA" && target.tagName == "TEXTAREA") ||
        $imagePreview ||
        $floatingMenu ||
        [...document.querySelectorAll("[data-slider]")].find((s) => s.contains(target)) ||
        (await ModalStack.getStack()).length
      )
        return;
      startedDragging = [e.changedTouches[0].pageX, e.changedTouches[0].pageY, Number($PaneLeft)];
    });
    Container.addEventListener("touchmove", (e) => {
      if (!startedDragging) return;
      if (
        document.activeElement?.tagName == "TEXTAREA" &&
        (e.changedTouches[0].target as HTMLElement).tagName == "TEXTAREA"
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
  afterUpdate(() =>
    document.querySelectorAll<HTMLElement>("[title]").forEach((e) => {
      const content = e.getAttribute("title");
      if (content) tippy(e, { content });
      e.removeAttribute("title");
    })
  );
</script>

{#if Native.isNative}
  <Titlebar />
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
      <Loader size={22} />
    </div>
  {:else}
    {#if !$MobileLayout || $PaneState !== PaneStates.RIGHT}
      <ServerList />
      <ChannelList />
    {/if}
    <ContentList />
    {#if !$MobileLayout ? !$MembersCollapsed : $PaneState !== PaneStates.LEFT}
      <MemberBar />
    {/if}
  {/if}

  <ImagePreview />
  <ModalRenderer />
  <FloatingMenu />
  <ContextMenu />
</div>
