<script lang="ts">
	import { Theme } from "$lib/Theme";

	export let isSelected = false;
	export let className = "";
	export let bg: string | undefined;
	export let color: string = $Theme["secondary-foreground"] || "";
	export let text = "";
	export let textColor = "";

	export let pos: "topLeft" | "bottomRight";
</script>

<div
	class="absolute {(() => {
		switch (pos) {
			case 'topLeft':
				return 'text-left ' + (className || (isSelected ? '-left-1 -top-1.5' : '-left-0.5 -top-1'));
			case 'bottomRight':
				return (
					'text-right ' +
					(className || (isSelected ? '-right-1 -bottom-1' : '-right-0.5 -bottom-0.5'))
				);
		}
	})()} flex items-center justify-center text-xs px-1 {!className ? 'h-5' : ''} rounded-full"
	style:background-color={color}
	style:border="3px solid {bg}"
	style:color={textColor || bg}
	style:min-width="1.25rem"
>
	{text || ""}
</div>
