<script lang="ts">
  import { client } from "Client";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";

  export let modal: Extract<ModalData, { type: "user" }>;
  let item: Modal;
</script>

<ModalBase {modal} bind:item>
  {#await client.users.fetch(modal.id)}
    ...
  {:then user}
    <div class="flex">
      uuid {user._id}
    </div>
  {:catch err}
    Failed to fetch user. {err}
  {/await}
</ModalBase>
