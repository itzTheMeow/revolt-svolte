<script lang="ts">
  import TWEEN from "@tweenjs/tween.js";
  import { UseMemberState } from "Client";
  import type { Member } from "revolt-toolset";
  import { MobileLayout } from "State";
  import { slide } from "svelte/transition";
  import { Theme } from "Theme";
  import { clickoutside } from "utils";
  import { MemberMenu } from "./MemberContextMenu";
  import MemberContextMenuInner from "./MemberContextMenuInner.svelte";

  let member: Member, MobileMemberInner: HTMLDivElement;

  $: {
    member = $MemberMenu?.member!;
  }
  function handleClickOut(e: MouseEvent | TouchEvent) {
    if (
      !e.composedPath().includes($MemberMenu?.target!) &&
      !e.composedPath().includes(document.getElementById("ContextMenu")!)
    )
      MemberMenu.set(null);
  }

  let dragging = false,
    pos = [-1, -1],
    TotalHeight = 0;

  function setOpacity(o: number) {
    MobileMemberInner.parentElement!.style.setProperty("--tw-bg-opacity", String(o));
  }
  function handleTouchStart(e: TouchEvent) {
    if (e.composedPath().includes(MobileMemberInner)) return;
    pos = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    TotalHeight = MobileMemberInner.offsetHeight;
  }
  function handleTouchMove(e: TouchEvent) {
    if (pos[0] == -1 && pos[1] == -1) return;
    const diff = e.changedTouches[0].clientY - pos[1];
    if (Math.abs(diff) > 3) dragging = true;
    if (dragging) {
      const h = Math.max(0, Math.round(TotalHeight - diff));
      MobileMemberInner.style.height = `${h}px`;
      if (MobileMemberInner.offsetHeight == h) setOpacity((1 - diff / TotalHeight) * 0.5);
    }
  }
  let going = false;
  function handleTouchEnd(e: TouchEvent) {
    if (e.composedPath().includes(MobileMemberInner)) return (pos = [-1, -1]);
    e.preventDefault();
    let isDone = false;
    if (dragging) {
      const diff = e.changedTouches[0].clientY - pos[1];
      dragging = false;
      setOpacity(0.5);
      if (diff > TotalHeight / 3) isDone = true;
    } else isDone = true;
    if (isDone) setOpacity(0);
    new TWEEN.Tween({ h: MobileMemberInner.offsetHeight })
      .to({ h: isDone ? 0 : TotalHeight }, 250)
      .onUpdate(({ h }) => {
        MobileMemberInner.style.height = MobileMemberInner.style.maxHeight = `${h}px`;
      })
      .onComplete(() => {
        if (isDone) MemberMenu.set(null);
        else MobileMemberInner.style.height = MobileMemberInner.style.maxHeight = "";
      })
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    pos = [-1, -1];
  }
</script>

{#if member}
  {#if !$MobileLayout}
    <div
      class="absolute rounded-md overflow-hidden shadow-sm shadow-black w-fit h-fit"
      style={Object.entries($MemberMenu?.pos || {})
        .map((e) => `${e[0]}:${e[1]}px`)
        .join(";") + `;background-color:${$Theme["primary-background"]}`}
      use:clickoutside={handleClickOut}
    >
      <div class="w-64">
        {#key $UseMemberState}
          <MemberContextMenuInner {member} />
        {/key}
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
        bind:this={MobileMemberInner}
        in:slide={{ duration: 250 }}
        on:introstart={() => {
          setOpacity(0.5);
        }}
        on:introend={() => {
          TotalHeight = MobileMemberInner.offsetHeight;
        }}
      >
        {#key $UseMemberState}
          <MemberContextMenuInner {member} />
        {/key}
      </div>
    </div>
  {/if}
{/if}