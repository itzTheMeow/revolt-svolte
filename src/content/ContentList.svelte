<script lang="ts">
  import {
    AppWidth,
    MobileLayout,
    PaneLeft,
    PaneState,
    SelectedChannel,
    updatePaneState,
  } from "State";
  import { Theme } from "Theme";
  import VoiceChannel from "./VoiceChannel.svelte";
  import TextChannel from "./TextChannel.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    updatePaneState($PaneState);
  });
</script>

<div
  class="h-full {$MobileLayout ? 'absolute top-0' : 'flex flex-col min-w-0'}"
  style="background-color:{$Theme['primary-background']};width:{$AppWidth}px;{$MobileLayout
    ? `left:${$PaneLeft}px;`
    : ''}"
  id="Pane"
>
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
