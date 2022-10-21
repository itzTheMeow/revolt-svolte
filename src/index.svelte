<script lang="ts">
  import { onMount } from "svelte";

  let time = new Date().toLocaleTimeString();

  onMount(() => {
    setInterval(() => {
      time = new Date().toLocaleTimeString();
    }, 1000);
  });
</script>

<div class="text-primary">
  hello from svelte.<br />
  Current Time: {time}
</div>
