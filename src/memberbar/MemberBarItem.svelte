<script lang="ts">
  import { CMState } from "contextmenu/ContextMenuState";
  import Indicator from "extra/Indicator.svelte";
  import { Member, type API } from "revolt.js";
  import { AppWidth } from "State";
  import { Theme } from "Theme";
  import { MemberDetails, StatusColor, UserColor, UserDetails } from "utils";

  export let item: (API.Role & { count: number }) | Member;
  let BarItem: HTMLDivElement;

  function handleClick(e: MouseEvent) {
    if (!(item instanceof Member)) return;
    CMState.set({
      type: "member",
      member: item,
      pos: {
        top: BarItem.getBoundingClientRect().top + 2,
        right: $AppWidth - BarItem.getBoundingClientRect().left + 6,
      },
      target: e.target,
    });
  }
</script>

{#if item instanceof Member}
  <div
    class="relative [--d:none] hover:[--d:block] rounded-md overflow-hidden px-1.5 cursor-pointer"
    bind:this={BarItem}
    on:click={handleClick}
  >
    <div
      class="absolute top-0 left-0 w-full h-full opacity-20"
      style:background={MemberDetails(item).color || "currentColor"}
      style:display={$CMState?.type == "member" && $CMState.member._id.user == item.user?._id
        ? "block"
        : "var(--d)"}
    />
    <div
      class="inline-flex gap-1.5 w-full items-center my-1 relative"
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
            color={$Theme[StatusColor(item.user)]}
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
  </div>
{:else}
  <div
    class="block mb-0.5 font-bold overflow-hidden whitespace-nowrap overflow-ellipsis"
    style={UserColor(item.colour || "inherit")}
  >
    {item.name}{item.count > 1 ? ` - ${item.count.toLocaleString()}` : ""}
  </div>
{/if}
