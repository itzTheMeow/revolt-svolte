<script lang="ts">
  import { Theme } from "Theme";
  import { clickoutside } from "utils";
  import { CMState } from "./ContextMenuState";

  function handleClickOut(e: MouseEvent | TouchEvent) {
    if(!e.composedPath().includes(document.getElementById("UploaderButton")!)) CMState.set(null);
  }
</script>

{#if $CMState}
  <ul
    class="menu rounded-md absolute w-fit h-fit shadow-sm shadow-black"
    style={Object.entries($CMState.pos)
      .map((e) => `${e[0]}:${e[1]}px`)
      .join(";")}
    style:background={$Theme["primary-background"]}
    use:clickoutside={handleClickOut}
  >
    {#each $CMState.options as opt}
      <li>
        <div
          class="active:bg-inherit"
          on:click={() => {
            opt.clicked();
            setTimeout(() => {
              CMState.set(null);
            }, 10);
          }}
        >
          {#if opt.icon}
            <svelte:component this={opt.icon} />
          {/if}{opt.name}
        </div>
      </li>
    {/each}
  </ul>
{/if}
