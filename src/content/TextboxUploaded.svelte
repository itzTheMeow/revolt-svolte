<script lang="ts">
  import { IconCircleX } from "@tabler/icons-svelte";
  import { uploadedFiles } from "State";
  import { Theme } from "Theme";
</script>

{#if $uploadedFiles.length}
  <div
    class="flex py-2 overflow-x-auto w-full"
    style="height:20%;background-color:{$Theme['primary-header']};"
  >
    {#each $uploadedFiles as file}
      <div
        class="relative rounded bg-white bg-opacity-25 flex items-center justify-center mx-1 h-full cursor-pointer"
        on:click={() => {
          const i = $uploadedFiles.indexOf(file);
          if (i >= 0) $uploadedFiles.splice(i, 1);
          URL.revokeObjectURL(file.url);
          $uploadedFiles = $uploadedFiles;
        }}
      >
        {#if file.type == "image"}
          <img src={file.url} alt={file.name} class="h-full rounded" />
        {:else}
          <div class="m-1.5">{file.name}</div>
        {/if}
        <div
          class="rounded absolute top-0 left-0 h-full w-full bg-black bg-opacity-25 flex items-center justify-center text-error"
        >
          <IconCircleX />
        </div>
      </div>
    {/each}
  </div>
{/if}
