<script lang="ts">
  export let icon: string | ConstructorOfATypedSvelteComponent;
  export let rounded = false;
  export let name: string;
  export let detail: string = "";
  export let onclick: () => any;

  const iconSize = 20;

</script>

<div
  class="p-1 bg-white bg-opacity-5 flex items-center rounded mx-2 my-1.5
    cursor-pointer"
  on:touchend={(e) => {
    e.preventDefault();
    onclick();
    return false;
  }}
  on:click={onclick}>
  {#if typeof icon == 'string'}
    <img
      src={icon}
      width={iconSize}
      height={iconSize}
      class="object-cover aspect-square {rounded ? 'rounded-full' : ''}"
      alt="" />
  {:else}
    <svelte:component this={icon} size={iconSize} />
  {/if}
  <div class="ml-1.5">{name}</div>
  {#if detail}
    <div class="ml-auto mr-0.5 text-sm brightness-75">{detail}</div>
  {/if}
</div>
