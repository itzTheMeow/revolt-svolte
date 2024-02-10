<script lang="ts">
	import { Theme } from "$lib/Theme";
	import { IconRobotFace } from "@tabler/icons-svelte";

	/** Size for the icon. (default: 16) */
	export let size = 16;
</script>

<IconRobotFace {size} color={$Theme["accent"]} />
