<script lang="ts">
	import { Theme } from "$lib/Theme";
	import { IconRobotFace } from "@tabler/icons-svelte";

	/** Size for the icon. (default: 16) */
	export let size = 16;
	/** Color for the icon. (default: Theme.accent) */
	export let color = $Theme["accent"];
</script>

<IconRobotFace {size} {color} />
