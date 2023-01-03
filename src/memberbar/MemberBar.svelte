<script lang="ts">
  import { client } from "Client";
  import type { API, Member } from "revolt-toolset";
  import { AppWidth, MobileLayout, PaneLeft, SelectedChannel, SelectedServer } from "State";
  import { writable } from "svelte/store";
  import { Theme } from "Theme";
  import { MemberDetails, UserDetails } from "utils";
  import MemberBarItem from "./MemberBarItem.svelte";
  import VirtualList from "./VirtualList.svelte";

  let membar: HTMLDivElement;
  const memstate = writable(false);

  let memberList: [string, API.Role, Member[]][] = [];
  $: {
    if ($SelectedServer) {
      const l: typeof memberList = [];
      const members = [...client.members.values()].filter(
        (m) =>
          m.server?._id == $SelectedServer?._id &&
          (!$SelectedChannel || m.hasPermission($SelectedChannel, "ViewChannel"))
      );
      const offline = members.filter((m) => !UserDetails(m.user).online);
      members
        .filter((m) => m.hoistedRole && !offline.includes(m))
        .forEach((m) => {
          const i = l.findIndex((item) => item[0] == m.hoistedRole![0]);
          if (i >= 0) l[i][2].push(m);
          else l.push([m.hoistedRole![0], m.hoistedRole![1], [m]]);
        });
      l.sort((l1, l2) => (l1[1].rank ?? 0) - (l2[1].rank ?? 0));
      l.push([
        "",
        { name: "Online", permissions: { a: 0, d: 0 } },
        members.filter((m) => !m.hoistedRole && !offline.includes(m)),
      ]);
      if (!l[l.length - 1][2].length) l.pop();
      l.push(["", { name: "Offline", permissions: { a: 0, d: 0 } }, offline]);
      if (!l[l.length - 1][2].length) l.pop();
      l.forEach((item) =>
        item[2].sort((m1, m2) =>
          MemberDetails(m1).name.toLowerCase() > MemberDetails(m2).name.toLowerCase() ? 1 : -1
        )
      );
      memberList = l;
      if (!$memstate)
        $SelectedServer
          // *really* shouldnt be hardcoding this but revite does and theres no way to tell if a server is 'large'
          .syncMembers($SelectedServer._id == "01F7ZSBSFHQ8TA81725KQCSDDP")
          .then(() => memstate.set(true));
    } else memberList = [];
  }
</script>

<div
  class="overflow-y-auto h-full w-64 {$MobileLayout ? 'absolute' : ''}"
  style="background-color:{$Theme['secondary-background']};{$MobileLayout
    ? `left:${$PaneLeft + $AppWidth}px;`
    : ''}"
  id="MemberBar"
  bind:this={membar}
>
  {#if $SelectedServer}
    <VirtualList
      items={memberList.map((l) => [{ ...l[1], count: l[2].length }, ...l[2]]).flat(1)}
      let:item
    >
      <MemberBarItem {item} />
    </VirtualList>
  {:else}
    <div class="text-sm ml-1.5">No members.</div>
  {/if}
</div>
