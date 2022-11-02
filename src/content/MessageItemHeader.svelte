<script lang="ts">
  import type { Message } from "revolt.js";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";

  export let message: Message;
</script>

<div class="flex items-center gap-1.5 -mb-0.5" style="line-height:1.1;">
  <div class="font-semibold" style="color:{MessageDetails(message).color || 'inherit'};">
    {MessageDetails(message).name}
  </div>
  {#if message.author?.bot}
    <div
      class="rounded px-1 py-0.5 flex items-center justify-center"
      style="background-color:{$Theme['accent']};font-size:0.65rem;"
    >
      {message.masquerade ? "BRIDGE" : "BOT"}
    </div>
  {/if}
</div>
