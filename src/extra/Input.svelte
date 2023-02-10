<script lang="ts">
  import { Theme } from "Theme";

  export let value = "",
    type: "input" | "textarea" = "input",
    className = "";
</script>

{#if type == "input"}
  <input
    class="rounded-md px-4 py-3 w-full {className}"
    style:background={$Theme["secondary-background"]}
    bind:value
  />
{:else}
  <textarea
    class="rounded-md px-4 py-3 w-full {className}"
    style:background={$Theme["secondary-background"]}
    bind:value
  />
{/if}
