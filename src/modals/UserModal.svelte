<script lang="ts">
  import { IconX } from "@tabler/icons-svelte";
  import { client } from "Client";
  import Indicator from "extra/Indicator.svelte";
  import Loader from "Loader.svelte";
  import type { User, UserProfile } from "revolt-toolset";
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import { proxyURL, StatusColor, UserDetails } from "utils";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";

  export let modal: Extract<ModalData, { type: "user" }>;
  let item: Modal,
    fetched = "";

  let user: User, profile: UserProfile;

  function fetch(id: string) {
    return new Promise<void>(async (res, rej) => {
      if (fetched !== id) {
        fetched = id;
        user = await client.users.fetch(id);
        if (!user) rej("User does not exist.");
        profile = await user.fetchProfile();
      }
      res(void 0);
    });
  }
</script>

<ModalBase
  {modal}
  bind:item
  full={$MobileLayout}
  className="p-0 overflow-hidden {$MobileLayout ? '' : 'max-w-none w-1/2 h-2/3'}"
>
  {#await fetch(modal.id)}
    <div class="w-full h-full flex items-center justify-center"><Loader /></div>
  {:then _}
    <div
      class="flex items-center w-full h-32 bg-cover bg-center p-4 relative"
      style:background-image={profile?.background
        ? `url(${proxyURL(profile.generateBackgroundURL({ max_side: 256 }) || "", "image")})`
        : ""}
      style:background-color={$Theme["secondary-background"]}
    >
      <div
        class="rounded-full p-1 w-16 h-16 relative"
        style:background-color={$Theme["primary-background"]}
      >
        <img
          class="avatar rounded-full w-full h-full object-cover"
          src={UserDetails(user).avatar}
          alt={UserDetails(user).name}
        />
        <Indicator
          pos="bottomRight"
          color={$Theme[StatusColor(user)]}
          bg={$Theme["primary-background"]}
          className="h-6 w-6 -right-0.5 -bottom-0.5"
        />
      </div>
    </div>
  {:catch err}
    Failed to fetch user. {err}
  {/await}
  {#if $MobileLayout}
    <div
      class="absolute top-3 right-3 p-1 rounded-full"
      style:background={$Theme["tooltip"]}
      on:click={() => item.close()}
    >
      <IconX size={26} />
    </div>
  {/if}
</ModalBase>
