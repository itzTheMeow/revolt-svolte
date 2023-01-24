<script lang="ts">
  import Image from "media/Image.svelte";
  import { DefaultEmoji, type Emoji } from "revolt-toolset";
  import { SelectedServer } from "State";
  import { proxyURL } from "utils";
  import { floatingMenu } from "./FloatingMenu";

  export let emoji: Emoji | DefaultEmoji;
  $: if (emoji instanceof DefaultEmoji) emoji.setPack("twemoji");
</script>

<div class="flex gap-2 m-2.5">
  <Image className="w-12 h-12" src={proxyURL(emoji.imageURL, "image")} alt={emoji.name} square />
  <div class="flex flex-col justify-center items-center">
    <div class="text-xl font-bold">:{emoji.uniqueName}:</div>
    {#if emoji instanceof DefaultEmoji}
      <div>Default Emoji</div>
    {:else if emoji.parent}
      <div
        class="flex items-center gap-0.5 cursor-pointer"
        on:click={() => {
          floatingMenu.set(null);
          $SelectedServer = emoji.parent;
        }}
      >
        <img
          class="h-4 w-4 rounded-full"
          src={emoji.parent.generateIconURL({ max_side: 64 })}
          alt=""
        />
        <div>{emoji.parent.name}</div>
      </div>
    {/if}
  </div>
</div>
