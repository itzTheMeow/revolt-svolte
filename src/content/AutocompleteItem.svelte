<script lang="ts">
  import { selectedAutocomplete } from "State";

  export let id: string;
  export let icon: string | ConstructorOfATypedSvelteComponent;
  export let rounded = false;
  export let name: string;
  export let detail: string = "";
  export let onclick: () => any;

  const iconSize = 20;

  let selected = false;

  $: selected = id == $selectedAutocomplete;
</script>

<div
  class="p-1 bg-white {selected
    ? 'bg-opacity-5'
    : 'bg-opacity-0 hover:bg-opacity-[0.03]'} flex items-center rounded mx-2.5 my-1 cursor-pointer transition"
  on:touchend|preventDefault={onclick}
  on:mousedown|preventDefault
  on:click|preventDefault={onclick}
>
  {#if typeof icon == "string"}
    <img
      src={icon}
      width={iconSize}
      height={iconSize}
      class="object-cover aspect-square {rounded ? 'rounded-full' : ''}"
      alt=""
    />
  {:else}
    <svelte:component this={icon} size={iconSize} />
  {/if}
  <div class="ml-1.5">{name}</div>
  {#if detail}
    <div class="ml-auto mr-0.5 text-sm brightness-75">{detail}</div>
  {/if}
</div>
