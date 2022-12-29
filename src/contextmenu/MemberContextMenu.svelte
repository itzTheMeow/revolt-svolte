<script lang="ts">
  import type { Member } from "revolt.js";
  import { MemberDetails, UserColor } from "utils";

  export let member: Member;
</script>

<div class="p-4">
  <img
    class="avatar rounded-full w-12 h-12 object-contain"
    src={MemberDetails(member).avatar}
    alt={MemberDetails(member).name}
  />
  <div style={UserColor(MemberDetails(member).color)}>{MemberDetails(member).name}</div>
</div>
