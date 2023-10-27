<script lang="ts">
	import { Theme } from "$lib/Theme";
	import { ServerSettingsChanges } from "../Settings";
</script>

{#if $ServerSettingsChanges}
	<div
		class="btn btn-sm border-none font-bold"
		style:background-color={$Theme["success"]}
		style:color={$Theme["background"]}
		on:click={async (e) => {
			if (!$ServerSettingsChanges) return;
			//@ts-ignore
			e.target.classList.add("loading");
			await $ServerSettingsChanges.save();
			//@ts-ignore
			e.target.classList.remove("loading");
			ServerSettingsChanges.set(null);
		}}
	>
		Save
	</div>
	<div
		class="btn btn-sm border-none font-bold"
		style:background-color={$Theme["error"]}
		style:color={$Theme["background"]}
		on:click={async (e) => {
			if (!$ServerSettingsChanges) return;
			$ServerSettingsChanges.cancel();
			ServerSettingsChanges.set(null);
		}}
	>
		Cancel
	</div>
{/if}
