<script lang="ts">
  import {
    CustomBadges,
    RevoltBadgeData,
    type CustomBadge,
    type User,
    type UserBadge as UBadge,
  } from "revolt-toolset";
  import UserBadge from "./UserBadge.svelte";

  export let user: User;
  export let size = 20;

  let badges: (CustomBadge | UBadge)[] = [];
  $: badges = [
    ...user.badges.all().map((b) => RevoltBadgeData[b]),
    ...CustomBadges.filter((b) => b.ids.includes(user.id)),
  ];
</script>

{#if badges.length}
  <div class="flex gap-2">
    {#each badges as data}
      <UserBadge {data} {size} />
    {/each}
  </div>
{/if}
