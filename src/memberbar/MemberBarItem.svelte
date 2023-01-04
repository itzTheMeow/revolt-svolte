<script lang="ts">
  import { MemberMenu } from "contextmenu/MemberContextMenu";
  import Indicator from "extra/Indicator.svelte";
  import UserTag from "extra/UserTag.svelte";
  import { Member, Role } from "revolt-toolset";
  import { AppHeight, AppWidth } from "State";
  import { tippy } from "svelte-tippy";
  import { Crown } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { MemberDetails, StatusColor, UserColor, UserDetails } from "utils";

  export let item: [Role, number] | Member;
  let BarItem: HTMLDivElement;

  function handleClick(e: MouseEvent) {
    if (!(item instanceof Member)) return;
    const rect = BarItem.getBoundingClientRect(),
      isTop = rect.top + rect.height / 2 <= $AppHeight / 2;
    MemberMenu.set({
      member: item,
      pos: {
        [isTop ? "top" : "bottom"]: isTop ? rect.top + 2 : $AppHeight - rect.bottom + 2,
        right: $AppWidth - BarItem.getBoundingClientRect().left + 6,
      },
      target: e.target,
      bar: true,
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
      style:display={$MemberMenu && $MemberMenu.member.id == item.user?.id && $MemberMenu.bar
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
          class="font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis inline-flex items-center gap-1"
          style:line-height="1.1"
        >
          <div
            class="overflow-hidden overflow-ellipsis"
            style={UserColor(MemberDetails(item).color || "inherit")}
          >
            {MemberDetails(item).name}
          </div>
          {#if item.user?.bot}
            <UserTag text="BOT" />
          {/if}
          {#if item.id == item.server?.ownerID}
            <div
              use:tippy={{
                content: "Server Owner",
                placement: "left",
              }}
            >
              <Crown size={16} color="gold" />
            </div>
          {/if}
        </div>
        {#if item.user?.status && UserDetails(item.user).online}
          <div
            class="text-xs w-full overflow-hidden whitespace-nowrap overflow-ellipsis"
            style:color={$Theme["tertiary-foreground"]}
          >
            {item.user.status}
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="block mb-0.5 px-1 font-bold overflow-hidden whitespace-nowrap overflow-ellipsis"
    style={UserColor(item[0].color || "inherit")}
  >
    {item[0].name}{item[1] > 1 ? ` - ${item[1].toLocaleString()}` : ""}
  </div>
{/if}
