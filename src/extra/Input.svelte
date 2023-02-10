<script lang="ts">
  import { Theme } from "Theme";

  export let value = "";
  export let type: "input" | "textarea" = "input";
</script>

{#if type == "input"}
  <input
    class="rounded-md px-4 py-3"
    style:background={$Theme["secondary-background"]}
    bind:value
  />
{:else}
  <textarea
    class="rounded-md px-4 py-3"
    style:background={$Theme["secondary-background"]}
    bind:value
  />
{/if}
