<script lang="ts">
  import Header from "extra/Header.svelte";
  import Indicator from "extra/Indicator.svelte";
  import { Permissions, type Member, type UserProfile } from "revolt-toolset";
  import { tippy } from "svelte-tippy";
  import { Crown, X } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { MemberDetails, proxyURL, StatusColor, UserColor } from "utils";
  import { copyIDItem, showOptionContext } from "./ContextMenus";

  export let member: Member;
  let profile: UserProfile,
    fetched = "",
    canRoleManage = false;

  $: {
    if (fetched !== member.id) {
      fetched = member.id;
      member.user.fetchProfile().then((p) => (profile = p));
    }
    canRoleManage = !!member.server.me?.permissions.has(Permissions.ManageRole);
  }
</script>

<div class="w-64">
  <div
    class="flex items-center justify-center w-full h-24 bg-cover bg-center p-4 relative"
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
        <div use:tippy={{ content: "Server Owner" }}><Crown color="gold" /></div>
      {/if}
      <div
        class="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis"
        use:tippy={{
          content: "@" + member.user.username,
        }}
      >
        {MemberDetails(member).name}
      </div>
    </div>
    {#if member.roles.length}
      <Header className="mt-2 mb-1">Roles</Header>
      <div class="flex gap-1 flex-wrap">
        {#each member.roles.reverse() as role}
          <div
            class="rounded overflow-hidden relative w-fit px-1.5 py-0.5 flex items-center gap-1 cursor-pointer [--hov:none] hover:[--hov:flex]"
            on:click={() => {
              if (canRoleManage) member.removeRole(role);
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
              class="w-2.5 h-2.5 rounded-full flex items-center"
              style:background={role.color || "currentColor"}
            />
            <div class="text-xs relative">{role.name}</div>
            {#if canRoleManage}
              <div
                class="w-full h-full absolute top-0 left-0 items-center justify-center text-xs [display:var(--hov)]"
                style:background-color={$Theme["error"]}
              >
                <X size={14} strokeWidth={3} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
