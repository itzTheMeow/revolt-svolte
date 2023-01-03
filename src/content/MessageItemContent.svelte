<script lang="ts">
  import type { Message } from "revolt-toolset";
  import Markdown from "../markdown/Markdown.svelte";

  export let message: Message;
</script>

<Markdown text={message.content || ""} keepSpace />
