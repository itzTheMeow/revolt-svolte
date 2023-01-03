<script lang="ts">
  import {
    AppWidth,
    MobileLayout,
    PaneLeft,
    PaneState,
    PaneStates,
    SelectedChannel,
    updatePaneState,
  } from "State";
  import { onMount } from "svelte";
  import { Theme } from "Theme";
  import TextChannel from "./TextChannel.svelte";
  import VoiceChannel from "./VoiceChannel.svelte";

  onMount(() => {
    updatePaneState($PaneState);
  });
</script>

<div
  class="h-full flex flex-col {$MobileLayout ? 'absolute top-0' : 'flex-1 min-w-0'}"
  style="background-color:{$Theme['primary-background']};{$MobileLayout
    ? `left:${$PaneLeft}px;width:${$AppWidth}px;`
    : ''}"
  id="Pane"
  on:touchstart={(e) => {
    if ($MobileLayout && $PaneState !== PaneStates.MIDDLE) {
      e.preventDefault();
      return false;
    }
  }}
>
  {#if $SelectedChannel}
    {#if $SelectedChannel.isTextBased()}
      <TextChannel channel={$SelectedChannel} />
    {:else if $SelectedChannel.isVoice()}
      <VoiceChannel channel={$SelectedChannel} />
    {/if}
  {:else}
    Select a channel!
  {/if}
</div>
