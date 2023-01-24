<script lang="ts">
  import { UseMemberState } from "Client";
  import FloatingEmojiMenu from "./FloatingEmojiMenu.svelte";
  import FloatingMemberMenu from "./FloatingMemberMenu.svelte";
  import { floatingMenu } from "./FloatingMenu";
</script>

{#if $floatingMenu}
  {#if $floatingMenu.type == "member"}
    {#key $UseMemberState}
      <FloatingMemberMenu member={$floatingMenu.member} />
    {/key}
  {:else if $floatingMenu.type == "emoji"}
    <FloatingEmojiMenu emoji={$floatingMenu.emoji} />
  {/if}
{/if}
