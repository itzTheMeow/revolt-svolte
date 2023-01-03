<script lang="ts">
  import { client } from "Client";
  import { Permissions, Role, type Member } from "revolt-toolset";
  import { AppWidth, MobileLayout, PaneLeft, SelectedChannel, SelectedServer } from "State";
  import { writable } from "svelte/store";
  import { Theme } from "Theme";
  import { MemberDetails, UserDetails } from "utils";
  import MemberBarItem from "./MemberBarItem.svelte";
  import VirtualList from "./VirtualList.svelte";

  let membar: HTMLDivElement;
  const memstate = writable(false);

  let memberList: [Role, Member[]][] = [];
  $: {
    if ($SelectedServer) {
      const l: typeof memberList = [];
      const members = $SelectedServer.members.filter(
        (m) => !$SelectedChannel || $SelectedChannel.permissionsFor(m).has(Permissions.ViewChannel)
      );
      const offline = members.filter((m) => !UserDetails(m.user).online);
      members
        .filter((m) => m.hoistedRole && !offline.includes(m))
        .forEach((m) => {
          const i = l.findIndex((item) => item[0].id == m.hoistedRole.id);
          if (i >= 0) l[i][1].push(m);
          else l.push([m.hoistedRole, [m]]);
        });
      l.sort((l1, l2) => l1[0].rank - l2[0].rank);
      l.push([
        new Role(client, $SelectedServer, <any>{ name: "Online", permissions: { a: 0, d: 0 } }),
        members.filter((m) => !m.hoistedRole && !offline.includes(m)),
      ]);
      if (!l[l.length - 1][1].length) l.pop();
      l.push([
        new Role(client, $SelectedServer, <any>{ name: "Offline", permissions: { a: 0, d: 0 } }),
        offline,
      ]);
      if (!l[l.length - 1][1].length) l.pop();
      l.forEach((item) =>
        item[1].sort((m1, m2) =>
          MemberDetails(m1).name.toLowerCase() > MemberDetails(m2).name.toLowerCase() ? 1 : -1
        )
      );
      memberList = l;
      if (!$memstate)
        $SelectedServer.members // *really* shouldnt be hardcoding this but revite does and theres no way to tell if a server is 'large'
          .fetchAll($SelectedServer.id == "01F7ZSBSFHQ8TA81725KQCSDDP")
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
    <VirtualList items={memberList} let:item>
      <MemberBarItem {item} />
    </VirtualList>
  {:else}
    <div class="text-sm ml-1.5">No members.</div>
  {/if}
</div>
