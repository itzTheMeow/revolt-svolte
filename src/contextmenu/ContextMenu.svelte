<script lang="ts">
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import { clickoutside } from "utils";
  import { CMState, type ContextMenuStateOption } from "./ContextMenuState";

  function handleClick(e: MouseEvent | TouchEvent, opt: ContextMenuStateOption) {
    e.preventDefault();
    opt.clicked();
    setTimeout(() => {
      CMState.set(null);
    }, 10);
    return false;
  }
  function handleClickOut(e: MouseEvent | TouchEvent) {
    if (!e.composedPath().includes(document.getElementById("UploaderButton")!)) CMState.set(null);
  }
</script>

{#if $CMState}
  <ul
    class="menu rounded-md absolute w-fit h-fit shadow-sm shadow-black {!$MobileLayout
      ? 'p-1'
      : ''}"
    style={`background-color:${$Theme["primary-background"]};` +
      Object.entries($CMState.pos)
        .map((e) => `${e[0]}:${e[1]}px`)
        .join(";")}
    use:clickoutside={handleClickOut}
  >
    {#each $CMState.options as opt}
      <li>
        <div
          class="active:bg-inherit flex items-center gap-2 justify-center !rounded-md {!$MobileLayout
            ? 'px-3 py-1 text-[0.95rem]'
            : ''}"
          on:click={(e) => handleClick(e, opt)}
          on:touchend={(e) => handleClick(e, opt)}
        >
          {#if opt.icon}
            <svelte:component this={opt.icon} size={$MobileLayout ? 24 : 20} />
          {/if}
          <span>{opt.name}</span>
        </div>
      </li>
    {/each}
  </ul>
{/if}
