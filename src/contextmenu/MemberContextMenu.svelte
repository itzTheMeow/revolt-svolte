<script lang="ts">
  import Indicator from "extra/Indicator.svelte";
  import type { Member } from "revolt-toolset";
  import { Theme } from "Theme";
  import { MemberDetails, StatusColor, UserColor } from "utils";

  export let member: Member;
</script>

<div class="p-4">
  <div class="w-12 h-12 relative">
    <img
      class="avatar rounded-full w-full h-full object-cover"
      src={MemberDetails(member).avatar}
      alt={MemberDetails(member).name}
    />
    <Indicator
      pos="bottomRight"
      color={$Theme[StatusColor(member.user)]}
      bg={$Theme["primary-background"]}
      isSelected
    />
  </div>
  <div class="font-semibold" style={UserColor(MemberDetails(member).color)}>
    {MemberDetails(member).name}
  </div>
</div>
