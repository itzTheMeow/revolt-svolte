<script lang="ts">
  export let isSelected = false;
  export let bg: string | undefined;
  export let color: string | undefined;
  export let text = "";

  export let pos: "topLeft";
</script>

<div
  class="absolute {(() => {
    switch (pos) {
      case 'topLeft':
        return isSelected ? '-left-1 -top-1.5' : '-left-0.5 -top-1';
    }
  })()} flex items-center justify-center text-xs px-1 h-5 rounded-full text-left"
  style:background-color={color}
  style:border="3px solid {bg}"
  style:color={bg}
  style:min-width="1.25rem"
>
  {text || ""}
</div>
