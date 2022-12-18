<script lang="ts">
  export let placeholder = false;
  export let onclick: () => any;
</script>

<div
  class="avatar {placeholder
    ? 'placeholder'
    : ''} cursor-pointer box-border rounded-full w-12 h-12 relative"
  on:click={onclick}
>
  <slot />
</div>
