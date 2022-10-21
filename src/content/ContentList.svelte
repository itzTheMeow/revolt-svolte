<script lang="ts">
  import { SelectedChannel } from "State";
  import { Theme } from "Theme";
  import VoiceChannel from "./VoiceChannel.svelte";
  import TextChannel from "./TextChannel.svelte";
</script>

<div class="h-full flex-1 flex flex-col" style="background-color:{$Theme['primary-background']}">
  {#if $SelectedChannel}
    {#if $SelectedChannel.channel_type !== "VoiceChannel"}
      <TextChannel channel={$SelectedChannel} />
    {:else}
      <VoiceChannel channel={$SelectedChannel} />
    {/if}
  {:else}
    Select a channel!
  {/if}
</div>
