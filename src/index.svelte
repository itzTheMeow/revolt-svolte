<script lang="ts">
  import ChannelList from "channels/ChannelList.svelte";
  import { client } from "Client";
  import ContentList from "content/ContentList.svelte";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
  import {
    AppHeight,
    AppWidth,
    MessageCache,
    MobileLayout,
    PaneLeft,
    PaneState,
    PaneStates,
    pendBottom,
    pushMessages,
    selectInput,
    updatePaneState,
  } from "State";
  import { afterUpdate, onMount } from "svelte";
  import { Theme } from "Theme";
  import { disableBodyScroll } from "body-scroll-lock";
  import MemberBar from "memberbar/MemberBar.svelte";
  import TWEEN from "@tweenjs/tween.js";

  requestAnimationFrame(function animate(time: number) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
  });
  const BAR_BOTTOM = 26;
  client.on("message", (message) => {
    if ($MessageCache[message.channel_id]) pushMessages(message.channel!, [message]);
  });

  let previous = "";
  afterUpdate(() => {
    if ($pendBottom) {
      const ListMessages = document.getElementById("MessageList");
      if (ListMessages) ListMessages.scrollTop = ListMessages.scrollHeight * 2;
      $pendBottom = false;
    }
    if (previous == document.body.innerHTML) return;
    previous = document.body.innerHTML;
    document
      .querySelectorAll(".overflow-y-auto")
      .forEach((e) => e && disableBodyScroll(e, { allowTouchMove: () => true }));
    if ($selectInput) {
      $selectInput.focus();
      selectInput.set(null);
    }
  });

  $: {
    document.body.style.backgroundColor = $Theme["primary-background"]!;
    document.body.style.width = `${$AppWidth}px`;
    document.body.style.height = `${$AppHeight}px`;
  }

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

<div
  class="flex relative"
  style="height:{$AppHeight - ($MobileLayout ? BAR_BOTTOM : 0)}px;width:{$AppWidth}px;"
  bind:this={Container}
>
  {#await new Promise((r) => client.once("ready", () => r(void 0)))}
    <div class="m-auto">
      <Loader />
    </div>
  {:then}
    {#if !$MobileLayout || $PaneState !== PaneStates.RIGHT}
      <ServerList />
      <ChannelList />
    {/if}
    <ContentList />
    {#if !$MobileLayout || $PaneState !== PaneStates.LEFT}
      <MemberBar />
    {/if}
  {/await}
</div>
