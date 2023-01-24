<script lang="ts">
  import { UseMemberState } from "Client";
  import { floatingMenu } from "./FloatingMenu";
  import MemberContextMenuInner from "./MemberContextMenuInner.svelte";
</script>

{#if $floatingMenu}
  {#if $floatingMenu.type == "member"}
    {#key $UseMemberState}
      <MemberContextMenuInner member={$floatingMenu.member} />
    {/key}
  {:else if $floatingMenu.type == "emoji"}
    ok
  {/if}
{/if}
