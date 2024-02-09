<script lang="ts">
	import { UseTypingState } from "$lib/Client";
	import { SelectedChannel } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { MemberOrUserDetails } from "$lib/utils";
	import type { User } from "revkit";

	let typing: { user: User; details: ReturnType<typeof MemberOrUserDetails> }[] = [];

	$: {
		$UseTypingState;
		typing = !$SelectedChannel
			? []
			: $SelectedChannel.typing
					.map((u) => ({
						user: u,
						details: MemberOrUserDetails(
							u,
							$SelectedChannel?.isServerBased()
								? $SelectedChannel.server.members.get(u.id)
								: undefined,
						),
					}))
					.sort((u1, u2) =>
						u1.details.name.toLowerCase() > u2.details.name.toLowerCase() ? 1 : -1,
					);
	}
</script>

{#if typing.length}
	<div
		class="w-full h-6 flex items-center gap-1.5 text-xs px-1.5"
		style="background-color:{$Theme['primary-header']};"
	>
		<div class="flex {typing.length !== 1 ? 'pl-2' : ''}">
			{#each typing.map((t) => t.details.avatar) as src}
				<img
					class="w-4 h-4 rounded-full bg-inherit {typing.length !== 1 ? '-ml-1.5' : ''}"
					{src}
					alt=""
				/>
			{/each}
		</div>
		<div class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
			{typing.length <= 5 ? typing.map((t) => t.details.name).join(", ") : "Several people"}
			{typing.length == 1 ? "is" : "are"} typing...
		</div>
	</div>
{/if}
