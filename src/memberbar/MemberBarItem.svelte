<script lang="ts">
  import { type API, Member } from "revolt.js";
  import { Theme } from "Theme";
  import { MemberDetails, UserDetails } from "utils";

  export let item: (API.Role & { count: number }) | Member;
</script>

{#if item instanceof Member}
  <div class="inline-flex gap-1 items-center mb-1.5 select-none">
    <img
      class="rounded-full h-10 w-10 object-cover"
      src={MemberDetails(item).avatar}
      alt={item.user?.username}
    />
    <div class="flex flex-col">
      <div class="font-semibold" style:color={MemberDetails(item).color || "inherit"}>
        {MemberDetails(item).name}
      </div>
      {#if item.user?.status?.text && UserDetails(item.user).online}
        <div
          class="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis"
          style:color={$Theme["tertiary-foreground"]}
        >
          {item.user.status.text}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="inline-block mb-1 font-bold select-none" style:color={item.colour || "inherit"}>
    {item.name}{item.count > 1 ? ` - ${item.count.toLocaleString()}` : ""}
  </div>
{/if}
