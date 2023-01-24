<script lang="ts">
  import TWEEN from "@tweenjs/tween.js";
  import { MobileLayout } from "State";
  import { slide } from "svelte/transition";
  import { Theme } from "Theme";
  import { clickoutside } from "utils";
  import { floatingMenu } from "./FloatingMenu";
  import Inner from "./FloatingMenuInner.svelte";

  let FloatingMenuInner: HTMLDivElement;

  function handleClickOut(e: MouseEvent | TouchEvent) {
    if (
      !e.composedPath().includes($floatingMenu?.target!) &&
      !e.composedPath().includes(document.getElementById("ContextMenu")!)
    )
      floatingMenu.set(null);
  }

  let dragging = false,
    pos = [-1, -1],
    TotalHeight = 0;

  function setOpacity(o: number) {
    FloatingMenuInner.parentElement!.style.setProperty("--tw-bg-opacity", String(o));
  }
  function handleTouchStart(e: TouchEvent) {
    if (e.composedPath().includes(FloatingMenuInner)) return;
    pos = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    TotalHeight = FloatingMenuInner.offsetHeight;
  }
  function handleTouchMove(e: TouchEvent) {
    if (pos[0] == -1 && pos[1] == -1) return;
    const diff = e.changedTouches[0].clientY - pos[1];
    if (Math.abs(diff) > 3) dragging = true;
    if (dragging) {
      const h = Math.max(0, Math.round(TotalHeight - diff));
      FloatingMenuInner.style.height = `${h}px`;
      if (FloatingMenuInner.offsetHeight == h) setOpacity((1 - diff / TotalHeight) * 0.5);
    }
  }
  let going = false;
  function handleTouchEnd(e: TouchEvent) {
    if (e.composedPath().includes(FloatingMenuInner)) return (pos = [-1, -1]);
    e.preventDefault();
    let isDone = false;
    if (dragging) {
      const diff = e.changedTouches[0].clientY - pos[1];
      dragging = false;
      setOpacity(0.5);
      if (diff > TotalHeight / 3) isDone = true;
    } else isDone = true;
    if (isDone) setOpacity(0);
    new TWEEN.Tween({ h: FloatingMenuInner.offsetHeight })
      .to({ h: isDone ? 0 : TotalHeight }, 250)
      .onUpdate(({ h }) => {
        FloatingMenuInner.style.height = FloatingMenuInner.style.maxHeight = `${h}px`;
      })
      .onComplete(() => {
        if (isDone) floatingMenu.set(null);
        else FloatingMenuInner.style.height = FloatingMenuInner.style.maxHeight = "";
      })
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    pos = [-1, -1];
  }
</script>

{#if $floatingMenu}
  {#if !$MobileLayout}
    <div
      class="absolute rounded-md overflow-hidden shadow-sm shadow-black w-fit h-fit max-h-[50vh]"
      style={Object.entries($floatingMenu?.pos || {})
        .map((e) => `${e[0]}:${e[1]}px`)
        .join(";") + `;background-color:${$Theme["primary-header"]}`}
      use:clickoutside={handleClickOut}
    >
      <div class="{$floatingMenu.type == 'member' ? 'w-72' : ''} overflow-y-auto max-h-[inherit]">
        <Inner />
      </div>
    </div>
  {:else}
    <div
      class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 flex flex-col"
      style:transition={!dragging ? "background-color 250ms" : ""}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <div
        class="mx-auto mt-auto mb-2 w-1/3 min-h-[4px] rounded-full bg-white {dragging
          ? 'brightness-50'
          : 'brightness-75'} pointer-events-none"
      />
      <div
        class="rounded-t-xl overflow-hidden shadow-sm shadow-black w-full {dragging
          ? 'h-full max-h-[80%]'
          : 'h-fit max-h-[50%]'} overflow-y-auto"
        style:background-color={$Theme["primary-background"]}
        bind:this={FloatingMenuInner}
        in:slide={{ duration: 250 }}
        on:introstart={() => {
          setOpacity(0.5);
        }}
        on:introend={() => {
          TotalHeight = FloatingMenuInner.offsetHeight;
        }}
      >
        <Inner />
      </div>
    </div>
  {/if}
{/if}
