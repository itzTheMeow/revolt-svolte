<script lang="ts">
	import { client } from "$lib/Client";
	import { MobileLayout, SelectedChannel, SelectedServer } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { ServerDetails, StatusColor, UserDetails } from "$lib/utils";
	import {
		IconBan,
		IconMessageShare,
		IconUserMinus,
		IconUserPlus,
		IconUserX,
		IconX,
	} from "@tabler/icons-svelte";
	import Loader from "Loader.svelte";
	import Header from "extra/Header.svelte";
	import Indicator from "extra/Indicator.svelte";
	import Markdown from "markdown/Markdown.svelte";
	import {
		GroupDMChannel,
		RelationshipStatus,
		Server,
		UserPermissions,
		type User,
		type UserMutuals,
		type UserProfile,
	} from "revkit";
	import { onDestroy } from "svelte";
	import { tippy } from "svelte-tippy";
	import ModalBase from "./ModalBase.svelte";
	import type { Modal, ModalData } from "./ModalStack";
	import UserModalAction from "./UserModalAction.svelte";

	export let modal: Extract<ModalData, { type: "user" }>;
	let item: Modal,
		fetched = "";

	let user: User,
		profile: UserProfile,
		mutual: UserMutuals,
		err = "";

	let state = Date.now();
	function handleState() {
		state = Date.now();
	}
	$: if (fetched !== modal.id) {
		fetched = modal.id;
		client.users
			.fetch(modal.id)
			.then((u) => {
				user = u;

				if (!user) return (err = "User does not exist.");
				user
					.fetchProfile()
					.then((d) => (profile = d))
					.catch(
						() =>
							(profile = {
								background: null,
								bio: null,
								generateBackgroundURL() {
									return null;
								},
							}),
					);
				user
					.fetchMutual()
					.then((d) => (mutual = d))
					.catch(() => (mutual = { servers: [], friends: [] }));
			})
			.catch((err) => (console.error(err), (err = String(err?.message || err))));
	}

	let mutualServers: Server[] = [],
		mutualFriends: User[] = [],
		mutualGroups: GroupDMChannel[] = [];

	$: mutualServers =
		mutual?.servers
			.map((s) => client.servers.get(s)!)
			.filter((s) => s)
			.sort((s1, s2) => (s1.name.toLowerCase() > s2.name.toLowerCase() ? 1 : -1)) || [];

	$: if (user) {
		user.offUpdate(handleState);
		user.onUpdate(handleState);
	}
	onDestroy(() => {
		user?.offUpdate(handleState);
	});
</script>

<ModalBase
	{modal}
	bind:item
	full={$MobileLayout}
	className="p-0 overflow-hidden flex flex-col overflow-y-auto {$MobileLayout
		? ''
		: 'max-w-none w-1/2 h-2/3'}"
>
	{#key state}
		{#if !user}
			<div class="w-full h-full flex items-center justify-center"><Loader /></div>
		{:else if !err}
			<div
				class="flex {$MobileLayout
					? 'flex-col justify-center'
					: ''} items-center w-full h-40 bg-cover bg-center px-6 relative shrink-0"
				style:background-image={profile?.background
					? `url(${
							profile.generateBackgroundURL({
								max_side: Math.round($MobileLayout ? window.innerWidth : window.innerWidth / 2),
							}) || ""
					  })`
					: ""}
				style:background-color={$Theme["secondary-background"]}
			>
				<div
					class="{$MobileLayout
						? 'max-w-full'
						: 'mr-8'} rounded-xl px-3 py-2 flex items-center gap-2 shadow-md shadow-black overflow-hidden"
					style:background-color={$Theme["background"]}
				>
					<div class="rounded-full w-14 h-14 relative bg-inherit shrink-0">
						<img
							class="avatar rounded-full w-full h-full object-cover"
							src={UserDetails(user).avatar}
							alt={UserDetails(user).name}
						/>
						<Indicator
							pos="bottomRight"
							color={$Theme[StatusColor(user)]}
							bg={$Theme["background"]}
							className="h-6 w-6 -right-0.5 -bottom-0.5"
						/>
					</div>
					<div class="flex items-center flex-col flex-1 overflow-hidden">
						<div
							class="self-start font-semibold text-xl overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full"
						>
							{UserDetails(user).name}
						</div>
						{#if user.status}
							<div
								class="text-sm overflow-hidden overflow-ellipsis w-full"
								style:display="-webkit-box"
								style:-webkit-line-clamp="2"
								style:-webkit-box-orient="vertical"
							>
								{user.status}
							</div>
						{/if}
					</div>
				</div>
				<div class="{$MobileLayout ? 'mt-3' : 'ml-auto'} flex gap-2 items-center">
					{#if user.relationship !== RelationshipStatus.Self}
						{#if !user.bot}
							{#if user.relationship == RelationshipStatus.SelfBlocked}
								<UserModalAction
									tooltip="User has blocked you."
									icon={IconBan}
									onclick={() => {}}
									className="brightness-50 hover:!brightness-500 !cursor-not-allowed"
									color={$Theme["error"]}
								/>
							{:else if user.relationship == RelationshipStatus.Blocked}
								<UserModalAction
									tooltip="Unblock"
									icon={IconUserX}
									onclick={() => user.unblock()}
								/>
							{:else if user.relationship == RelationshipStatus.Outgoing}
								<UserModalAction
									tooltip="Cancel Outgoing Request"
									icon={IconX}
									onclick={() => user.removeFriend()}
								/>
							{:else}
								<UserModalAction
									tooltip={user.relationship == RelationshipStatus.Friend
										? "Remove Friend"
										: user.relationship == RelationshipStatus.Incoming
										? "Accept Friend Request"
										: "Add Friend"}
									icon={user.relationship == RelationshipStatus.Friend
										? IconUserMinus
										: IconUserPlus}
									onclick={() =>
										user.relationship == RelationshipStatus.Friend
											? user.removeFriend()
											: user.addFriend()}
									color={user.relationship == RelationshipStatus.Incoming
										? $Theme["success"]
										: "inherit"}
								/>
							{/if}
						{/if}
						{#if user.permissionsAgainst.has(UserPermissions.SendMessage)}
							<UserModalAction
								icon={IconMessageShare}
								tooltip="Message"
								onclick={async () => {
									const dm = await user.openDM();
									if (dm) {
										item.close();
										SelectedServer.set(null);
										SelectedChannel.set(dm);
									}
								}}
							/>
						{/if}
					{/if}
				</div>
			</div>
			<div
				class="flex-1 px-4 pt-2 pb-3 flex flex-col {profile && mutual
					? 'gap-4'
					: 'items-center justify-center'}"
			>
				{#if profile && mutual}
					{#if profile?.bio}
						<div>
							<Header large lower>About</Header>
							<Markdown text={profile.bio} />
						</div>
					{/if}
					{#if user.id !== client.user.id}
						<div>
							<Header large lower>Mutual Servers</Header>
							{#if mutualServers.length}
								<div class="flex gap-2 flex-wrap mt-1 {$MobileLayout ? '' : 'w-fit'}">
									{#each mutualServers as s (s.id)}
										<div
											class="{$MobileLayout
												? 'w-[48%] py-2'
												: 'w-32 py-4 flex-col'} gap-2 px-2 cursor-pointer bg-black bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-35 transition rounded-lg flex items-center justify-center"
											use:tippy={{ content: s.name }}
											on:click={() => (SelectedServer.set(s), item.close())}
										>
											{#if s.icon}
												<div
													class="{$MobileLayout
														? 'w-8 h-8'
														: 'w-12 h-12'} shrink-0 rounded-full overflow-hidden"
												>
													<img src={s.generateIconURL({ max_side: 64 })} alt="" />
												</div>
											{:else}
												<div
													class="{$MobileLayout
														? 'w-8 h-8'
														: 'w-12 h-12'} bg-black bg-opacity-30 rounded-full"
												>
													<span>
														{ServerDetails(s).acronym}
													</span>
												</div>
											{/if}
											<div
												class="{$MobileLayout
													? ''
													: 'text-center text-sm'} w-full overflow-hidden overflow-ellipsis whitespace-nowrap"
											>
												{s.name}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-xs ml-1" style:color={$Theme["secondary-foreground"]}>
									No mutual servers.
								</div>
							{/if}
						</div>
					{/if}
				{:else}
					<Loader size={26} />
				{/if}
			</div>
		{:else}
			Failed to fetch user. {err}
		{/if}
		{#if $MobileLayout}
			<div
				class="absolute top-3 right-3 p-1 rounded-full"
				style:background={$Theme["tooltip"]}
				on:click={() => item.close()}
			>
				<IconX size={26} />
			</div>
		{/if}
	{/key}
</ModalBase>
