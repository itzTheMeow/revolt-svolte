<script lang="ts">
	import { client } from "$lib/Client";
	import { AppWidth, MobileLayout, PaneLeft, SelectedChannel, SelectedServer } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { MemberDetails, UserDetails } from "$lib/utils";
	import { Permissions, Role, type Member } from "revkit";
	import VirtualScroll from "svelte-virtual-scroll-list";
	import MemberBarItem from "./MemberBarItem.svelte";

	let membar: HTMLDivElement;

	let memberList: [Role, Member[]][] = [];
	$: {
		if ($SelectedServer) {
			const l: typeof memberList = [];
			const members = $SelectedServer.members.filter(
				(m) => !$SelectedChannel || $SelectedChannel.permissionsFor(m).has(Permissions.ViewChannel),
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
				new Role(client, $SelectedServer, <any>{
					_id: "online",
					name: "Online",
					permissions: { a: 0, d: 0 },
				}),
				members.filter((m) => !m.hoistedRole && !offline.includes(m)),
			]);
			if (!l[l.length - 1][1].length) l.pop();
			l.push([
				new Role(client, $SelectedServer, <any>{
					_id: "offline",
					name: "Offline",
					permissions: { a: 0, d: 0 },
				}),
				offline,
			]);
			if (!l[l.length - 1][1].length) l.pop();
			l.forEach((item) =>
				item[1].sort((m1, m2) =>
					MemberDetails(m1).name.toLowerCase() > MemberDetails(m2).name.toLowerCase() ? 1 : -1,
				),
			);
			memberList = l;
		} else memberList = [];
	}

	let compiledMemberList: ([Role, number] | Member)[];
	$: compiledMemberList = memberList
		// either [Role, memberCount] or Member
		.map((i): typeof compiledMemberList => [[i[0], i[1].length], ...i[1]])
		.flat(1);
</script>

<div
	class="overflow-y-auto h-full w-64 px-2 [&>:first-child]:pt-1.5 [&>:last-child]:pb-1.5 {$MobileLayout
		? 'absolute'
		: ''}"
	style="background-color:{$Theme['secondary-background']};{$MobileLayout
		? `left:${$PaneLeft + $AppWidth}px;`
		: ''}"
	id="MemberBar"
	bind:this={membar}
>
	{#if $SelectedServer}
		<VirtualScroll
			data={compiledMemberList.map((item) => ({
				// create a unique ID from each entry
				id: Array.isArray(item) ? item[0].id : item.id,
				item,
			}))}
			key="id"
			let:data
		>
			<MemberBarItem item={data.item} />
		</VirtualScroll>
	{:else}
		<div class="text-sm ml-1.5">No members.</div>
	{/if}
</div>

<style>
</style>
