<script lang="ts">
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import { clickoutside } from "utils";
  import { CMState, type ContextMenuStateOption } from "./ContextMenuState";
  import MemberContextMenu from "./MemberContextMenu.svelte";

  function handleClick(e: MouseEvent | TouchEvent, opt: ContextMenuStateOption) {
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
    use:clickoutside={handleClickOut}
  >
    {#if $CMState.type == "options"}
      <ul class="menu {!$MobileLayout ? 'p-1' : ''}">
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
    {:else if $CMState.type == "member"}
      <MemberContextMenu member={$CMState.member} />
    {/if}
  </div>
{/if}
