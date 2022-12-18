<script lang="ts">
  import Indicator from "extra/Indicator.svelte";
  import { type API, Member } from "revolt.js";
  import { Theme } from "Theme";
  import { MemberDetails, UserColor, UserDetails } from "utils";

  export let item: (API.Role & { count: number }) | Member;
</script>

{#if item instanceof Member}
  <div
    class="inline-flex gap-1.5 w-full items-center mb-1.5 select-none"
    style:opacity={UserDetails(item.user).online ? "1" : "0.5"}
  >
    <div class="relative h-10 w-10">
      <img
        class="rounded-full h-full w-full object-cover"
        src={MemberDetails(item).avatar}
        alt={item.user?.username}
      />
      {#if UserDetails(item.user).online}
        <Indicator
          pos="bottomRight"
          bg={$Theme["secondary-background"]}
          color={(() => {
            switch (item.user?.status?.presence) {
              case "Busy":
                return $Theme["status-busy"];
              case "Focus":
                return $Theme["status-focus"];
              case "Idle":
                return $Theme["status-away"];
              case "Online":
              default:
                return $Theme["status-online"];
            }
          })()}
          isSelected
        />
      {/if}
    </div>
    <div class="flex flex-col" style:width="calc(100% - 2.5rem - 0.375rem)">
      <div
        class="font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis flex items-center gap-1.5"
        style:line-height="1.1"
      >
        <div style={UserColor(MemberDetails(item).color || "inherit")}>
          {MemberDetails(item).name}
        </div>
        {#if item.user?.bot}
          <div
            class="rounded px-1 py-0.5 flex items-center justify-center"
            style:background-color={$Theme["accent"]}
            style:font-size="0.65rem"
          >
            BOT
          </div>
        {/if}
      </div>
      {#if item.user?.status?.text && UserDetails(item.user).online}
        <div
          class="text-xs w-full overflow-hidden whitespace-nowrap overflow-ellipsis"
          style:color={$Theme["tertiary-foreground"]}
        >
          {item.user.status.text}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div
    class="block mb-1 font-bold select-none overflow-hidden whitespace-nowrap overflow-ellipsis"
    style={UserColor(item.colour || "inherit")}
  >
    {item.name}{item.count > 1 ? ` - ${item.count.toLocaleString()}` : ""}
  </div>
{/if}
