<script lang="ts">
	import { MobileLayout } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import IcoOwner from "$lib/icons/IcoOwner.svelte";
	import { MemberDetails, StatusColor, UserColor } from "$lib/utils";
	import { IconEye, IconPencil, IconPlus, IconSettings, IconX } from "@tabler/icons-svelte";
	import { Permissions, type Member, type UserProfile } from "revkit";
	import { tippy } from "svelte-tippy";
	import tinycolor from "tinycolor2";
	import Loader from "../Loader.svelte";
	import Header from "../extra/Header.svelte";
	import Indicator from "../extra/Indicator.svelte";
	import UserBadges from "../extra/UserBadges.svelte";
	import Markdown from "../markdown/Markdown.svelte";
	import { ModalStack } from "../modals/ModalStack";
	import { copyIDItem, showOptionContext } from "./ContextMenus";
	import { floatingMenu } from "./FloatingMenu";

	export let member: Member;

	let profile: UserProfile | null,
		fetched = "",
		canRoleManage = false,
		isRoleManaging = false,
		roleList = new Set<string>(),
		loading = false;

	$: {
		if (fetched !== member.id) {
			fetched = member.id;
			profile = null;
			member.user
				.fetchProfile()
				.then((p) => (profile = p))
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
		}
		canRoleManage = !!member.server.me?.permissions.has(Permissions.AssignRoles);
	}
</script>

<div
	class="flex items-center justify-center w-full h-24 p-4 relative {$MobileLayout
		? 'rounded-t-xl'
		: ''}"
	style:background={MemberDetails(member).color || $Theme["secondary-background"]}
>
	{#if profile?.background}
		<img
			class="w-full h-full absolute top-0 left-0 rounded-[inherit] object-cover"
			src={profile.generateBackgroundURL({ max_side: 288 }) || ""}
			alt=""
		/>
	{/if}
	<div
		class="rounded-full p-1 w-16 h-16 absolute left-4 -bottom-6 cursor-pointer [--d:0] hover:[--d:1]"
		style:background-color={$Theme["primary-header"]}
		use:tippy={{ content: "View Profile", placement: "right" }}
		on:click={() => {
			ModalStack.push({
				type: "user",
				id: member.id,
			});
			floatingMenu.set(null);
		}}
	>
		<img
			class="avatar rounded-full w-full h-full object-cover brightness-[calc(var(--d)*-.4+1)] transition"
			src={MemberDetails(member).avatar}
			alt={MemberDetails(member).name}
		/>
		<Indicator
			pos="bottomRight"
			color={$Theme[StatusColor(member.user)]}
			bg={$Theme["primary-header"]}
			className="h-6 w-6 -right-0.5 -bottom-0.5 pointer-events-none"
		/>
		<div
			class="absolute top-0 left-0 opacity-[var(--d)] transition rounded-full w-full h-full flex items-center justify-center pointer-events-none"
		>
			<IconEye />
		</div>
	</div>
</div>
<div class="pt-6 p-5">
	<div
		class="font-semibold text-xl flex items-center gap-0.5"
		style={UserColor(MemberDetails(member).color)}
	>
		{#if member.server.ownerID == member.id}
			<div use:tippy={{ content: "Server Owner" }}>
				<IcoOwner />
			</div>
		{/if}
		<div
			class="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis"
			use:tippy={{
				content: member.user.tag,
			}}
		>
			{MemberDetails(member).name}
		</div>
		<UserBadges user={member.user} />
	</div>
	{#if !profile || profile.bio}
		<Header className="mt-2 mb-1">About</Header>
		{#if profile?.bio}
			<Markdown text={profile.bio} />
		{:else}
			<Loader size={16} />
		{/if}
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
							style:color={tinycolor(
								roleList.has(role.id) ? $Theme["error"] : $Theme["success"],
							).isDark()
								? $Theme["foreground"]
								: $Theme["background"]}
						>
							{#if roleList.has(role.id)}
								<IconX size={$MobileLayout ? 16 : 14} stroke="3" />
							{:else}
								<IconPlus size={$MobileLayout ? 16 : 14} stroke="3" />
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
