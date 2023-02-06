<script lang="ts">
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import tinycolor from "tinycolor2";
  import { clickoutside } from "utils";
  import { CMState, type ContextMenuStateOption } from "./ContextMenuState";

  function handleClick(e: MouseEvent | TouchEvent, opt: ContextMenuStateOption | undefined) {
    if (!opt) return;
    e.preventDefault();
    opt.clicked();
    setTimeout(() => {
      CMState.set(null);
    }, 10);
    return false;
  }
  function handleClickOut(e: MouseEvent | TouchEvent) {
    if (!e.composedPath().includes($CMState?.target!)) CMState.set(null);
  }
</script>

{#if $CMState}
  <div
    class="absolute rounded-md overflow-hidden shadow-sm shadow-black w-fit h-fit"
    style={Object.entries($CMState?.pos || {})
      .map((e) => `${e[0]}:${e[1]}px`)
      .join(";") + `;background-color:${$Theme["primary-background"]}`}
    id="ContextMenu"
    use:clickoutside={handleClickOut}
  >
    <ul class="menu {!$MobileLayout ? '!p-1' : ''}">
      {#each $CMState.options as opt}
        {#if opt}
          <li>
            <div
              class="active:bg-inherit flex items-center gap-1 font-semibold justify-start !rounded-md {!$MobileLayout
                ? 'px-3 py-1 my-0.5 text-sm'
                : ''}"
              on:click={(e) => handleClick(e, opt)}
              on:touchend={(e) => handleClick(e, opt)}
              style:color={opt.danger ? $Theme["error"] : "inherit"}
            >
              {#if opt.icon}
                <svelte:component this={opt.icon} size={$MobileLayout ? 24 : 18} />
              {/if}
              <span>{opt.name}</span>
            </div>
          </li>
        {:else}
          <div
            class="h-[1px] w-10/12 mx-auto my-0.5"
            style:background="rgba({tinycolor($Theme["primary-background"]).isDark()
              ? "255,255,255"
              : "0,0,0"},0.1)"
          />
        {/if}
      {/each}
    </ul>
  </div>
{/if}
