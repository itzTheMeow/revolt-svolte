<script lang="ts">
  import { IconCrown, IconPencil, IconPlus, IconSettings, IconX } from "@tabler/icons-svelte";
  import Header from "extra/Header.svelte";
  import Indicator from "extra/Indicator.svelte";
  import UserBadges from "extra/UserBadges.svelte";
  import Loader from "Loader.svelte";
  import Markdown from "markdown/Markdown.svelte";
  import { Permissions, type Member, type UserProfile } from "revolt-toolset";
  import { MobileLayout } from "State";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";
  import { MemberDetails, proxyURL, StatusColor, UserColor } from "utils";
  import { copyIDItem, showOptionContext } from "./ContextMenus";

  export let member: Member;

  let profile: UserProfile,
    fetched = "",
    canRoleManage = false,
    isRoleManaging = false,
    roleList = new Set<string>(),
    loading = false;

  $: {
    if (fetched !== member.id) {
      fetched = member.id;
      member.user.fetchProfile().then((p) => (profile = p));
    }
    canRoleManage = !!member.server.me?.permissions.has(Permissions.AssignRoles);
  }
</script>

<div
  class="flex items-center justify-center w-full h-24 bg-cover bg-center p-4 relative {$MobileLayout
    ? 'rounded-t-xl'
    : ''}"
  style:background-image={profile?.background
    ? `url(${proxyURL(profile.generateBackgroundURL({ max_side: 256 }) || "", "image")})`
    : ""}
  style:background-color={MemberDetails(member).color || $Theme["secondary-background"]}
>
  <div
    class="rounded-full p-1 w-16 h-16 absolute left-4 -bottom-6"
    style:background-color={$Theme["primary-background"]}
  >
    <img
      class="avatar rounded-full w-full h-full object-cover"
      src={MemberDetails(member).avatar}
      alt={MemberDetails(member).name}
    />
    <Indicator
      pos="bottomRight"
      color={$Theme[StatusColor(member.user)]}
      bg={$Theme["primary-background"]}
      className="h-6 w-6 -right-0.5 -bottom-0.5"
    />
  </div>
</div>
<div class="pt-6 p-5">
  <div
    class="font-semibold text-xl flex items-center gap-0.5"
    style={UserColor(MemberDetails(member).color)}
  >
    {#if member.server.ownerID == member.id}
      <div use:tippy={{ content: "Server Owner" }}>
        <IconCrown color="gold" fill="gold" />
      </div>
    {/if}
    <div
      class="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis"
      use:tippy={{
        content: "@" + member.user.username,
      }}
    >
      {MemberDetails(member).name}
    </div>
    <UserBadges user={member.user} />
  </div>
  {#if profile?.bio}
    <Header className="mt-2 mb-1">About</Header>
    <Markdown text={profile.bio} />
  {/if}
  {#if canRoleManage || member.roles.length}
    <Header className="mt-2 mb-1">Roles</Header>
    <div class="flex gap-1 flex-wrap">
      {#each !isRoleManaging ? member.roles.reverse() : member.server.roles.ordered as role (role.id)}
        <div
          class="rounded overflow-hidden relative w-fit px-1.5 py-0.5 flex items-center gap-1 cursor-pointer [--hov:none] hover:[--hov:flex] hover:!opacity-100 {isRoleManaging &&
          !roleList.has(role.id)
            ? 'opacity-40'
            : ''}"
          on:click={() => {
            if (canRoleManage && isRoleManaging) {
              if (roleList.has(role.id)) roleList.delete(role.id);
              else roleList.add(role.id);
              roleList = roleList;
            }
          }}
          on:contextmenu={(e) => {
            showOptionContext(e, [copyIDItem(role)]);
          }}
        >
          <div
            class="w-full h-full absolute top-0 left-0 opacity-20"
            style:background={role.color || "currentColor"}
          />
          <div
            class="{$MobileLayout ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-full flex items-center"
            style:background={role.color || "currentColor"}
          />
          <div class="{$MobileLayout ? 'text-sm' : 'text-xs'} relative">{role.name}</div>
          {#if isRoleManaging}
            <div
              class="w-full h-full absolute top-0 left-0 items-center justify-center [display:var(--hov)]"
              style:background={roleList.has(role.id) ? $Theme["error"] : $Theme["success"]}
            >
              {#if roleList.has(role.id)}
                <IconX size={$MobileLayout ? 16 : 14} strokeWidth={3} />
              {:else}
                <IconPlus size={$MobileLayout ? 16 : 14} strokeWidth={3} />
              {/if}
            </div>
          {/if}
        </div>
      {/each}
      {#if canRoleManage}
        <div
          class="rounded overflow-hidden relative {isRoleManaging
            ? 'px-1.5'
            : 'px-[3px]'} py-0.5 flex items-center gap-1 cursor-pointer hover:brightness-75"
          on:click={async () => {
            if (!isRoleManaging) roleList = new Set(member.roles.map((r) => r.id));
            else {
              loading = true;
              await member.edit({ roles: [...roleList] });
              loading = false;
            }
            isRoleManaging = !isRoleManaging;
          }}
        >
          <div
            class="w-full h-full absolute top-0 left-0 opacity-20"
            style:background={isRoleManaging ? $Theme["success"] : "currentColor"}
          />
          <div
            class="{$MobileLayout ? 'text-sm' : 'text-xs'} relative flex items-center gap-0.5"
            style:color={isRoleManaging ? $Theme["success"] : "inherit"}
          >
            {#if isRoleManaging}
              {#if loading}
                <Loader size={$MobileLayout ? 16 : 14} />
              {:else}
                <IconPencil size={$MobileLayout ? 16 : 14} />
              {/if} Save
            {:else}
              <IconSettings size={$MobileLayout ? 16 : 14} />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
