<script lang="ts">
  import { floatingMenu, showMemberContext } from "contextmenu/FloatingMenu";
  import { ModalStack } from "modals/ModalStack";
  import type { Channel, Member, User } from "revkit";
  import { MemberDetails, UserColor } from "utils";

  export let user: User, channel: Channel, icon: ConstructorOfATypedSvelteComponent, text: string;

  let member: Member | undefined = undefined;
  $: member = channel.isServerBased() ? channel.server.members.get(user.id) : undefined;
</script>

<div class="flex items-center gap-1 py-1">
  <svelte:component this={icon} />
  <div
    class="flex items-center font-semibold hover:underline cursor-pointer gap-1 ml-1"
    data-clickable
    on:click={(e) => {
      if (member) showMemberContext(member, e.clientX, e.clientY, e.target);
      else ModalStack.push({ type: "user", id: user.id });
      e.preventDefault();
      e.stopPropagation();
      return false;
    }}
    on:dblclick={(e) => {
      if ($floatingMenu) floatingMenu.set(null);
      ModalStack.push({ type: "user", id: user.id });
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
      return false;
    }}
  >
    <img
      class="w-6 h-6 rounded-full object-cover"
      src={user.generateAvatarURL({ max_side: 64 })}
      alt=""
    />
    <div style={UserColor(MemberDetails(member).color || "inherit")}>
      {user.username}
    </div>
  </div>
  {text}.
</div>
