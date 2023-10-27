<script lang="ts">
	import { MembersCollapsed, MobileLayout, PaneState, PaneStates } from "$lib/State";
	import ChannelList from "$lib/channels/ChannelList.svelte";
	import ContentList from "$lib/content/ContentList.svelte";
	import MemberBar from "$lib/memberbar/MemberBar.svelte";
	import ServerList from "$lib/servers/ServerList.svelte";
</script>

{#if !$MobileLayout || $PaneState !== PaneStates.RIGHT}
	<ServerList />
	<ChannelList />
{/if}
<ContentList />
{#if !$MobileLayout ? !$MembersCollapsed : $PaneState !== PaneStates.LEFT}
	<MemberBar />
{/if}
