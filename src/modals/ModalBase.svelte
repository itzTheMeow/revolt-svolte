<script lang="ts">
  import TWEEN from "@tweenjs/tween.js";
  import { AppHeight, MobileLayout } from "State";
  import { createEventDispatcher } from "svelte";
  import { scale } from "svelte/transition";
  import { Theme } from "Theme";
  import { ModalStack, type Modal, type ModalData } from "./ModalStack";

  const dispatch = createEventDispatcher();

  export let modal: ModalData;
  export let className = "";
  export let full = false;
  export const item: Modal = {
    close() {
      ModalStack.close(modal);
    },
  };

  let dragging = false,
    pos = [-1, -1],
    container: HTMLDivElement;

  function handleTouchStart(e: TouchEvent) {
    pos = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
  }
  function handleTouchMove(e: TouchEvent) {
    const diff = e.changedTouches[0].clientY - pos[1];
    if (pos[0] == -1 && pos[1] == -1) return;
    if (diff > 3 && container.scrollTop <= 0) dragging = true;
    if (dragging) {
      const h = Math.max(0, Math.round(diff));
      container.style.top = `${h}px`;
      container.style.opacity = String(1 - diff / $AppHeight / 3);
      container.style.filter = `blur(${(diff / $AppHeight) * 3}px)`;
    }
  }
  function handleTouchEnd(e: TouchEvent) {
    if (!dragging) return;
    e.preventDefault();
    let isDone = false;
    if (dragging) {
      const diff = e.changedTouches[0].clientY - pos[1];
      dragging = false;
      container.style.opacity = "1";
      container.style.filter = "";
      if (diff > $AppHeight * 0.25) isDone = true;
    } else isDone = true;
    if (isDone) {
      container.style.opacity = "0";
      container.style.filter = "blur(3px)";
    }
    new TWEEN.Tween({ t: Number(container.style.top?.replace("px", "")) || 0 })
      .to({ t: isDone ? $AppHeight : 0 }, 250)
      .onUpdate(({ t }) => {
        container.style.top = `${t}px`;
      })
      .onComplete(() => {
        if (isDone) item.close();
        else container.style.top = "";
      })
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    pos = [-1, -1];
  }
</script>

<div
  class="modal modal-open bg-black bg-opacity-0"
  style:transition="200ms background"
  bind:this={container}
  on:click={(e) =>
    //@ts-ignore
    e.target.classList.contains("modal") && (dispatch("cancel"), item.close())}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  {#if $MobileLayout && full}
    <div
      class="modal-box relative w-full h-full rounded-none max-w-full max-h-full {dragging
        ? 'absolute top-0 left-0'
        : 'overflow-y-auto'} {className}"
      style:transition={!dragging ? "opacity 250ms, filter 250ms" : ""}
      style:background-color={$Theme["background"]}
      in:scale={{ duration: 200, start: 0.3 }}
    >
      <slot />
    </div>
  {:else}
    <div
      class="modal-box relative {full
        ? 'w-full h-full rounded-none max-w-full max-h-full'
        : ''} {className}"
      style:background-color={$Theme["background"]}
      in:scale={{ duration: 200, start: 0.3 }}
      on:introstart={(e) => {
        if (!full) e.currentTarget.parentElement?.classList.add("bg-opacity-70");
      }}
      out:scale={{ duration: 200 }}
      on:outrostart={(e) => {
        e.currentTarget.parentElement?.classList.remove("bg-opacity-70");
      }}
    >
      <slot />
    </div>
  {/if}
</div>
