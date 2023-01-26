<script lang="ts">
  import {
    IconBan,
    IconMessageShare,
    IconUserMinus,
    IconUserPlus,
    IconUserX,
    IconX,
  } from "@tabler/icons-svelte";
  import { client } from "Client";
  import Indicator from "extra/Indicator.svelte";
  import Loader from "Loader.svelte";
  import { RelationshipStatus, type User, type UserProfile } from "revolt-toolset";
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import { proxyURL, StatusColor, UserDetails } from "utils";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";
  import UserModalAction from "./UserModalAction.svelte";

  export let modal: Extract<ModalData, { type: "user" }>;
  let item: Modal,
    fetched = "";

  let user: User, profile: UserProfile;

  function fetch(id: string) {
    return new Promise<void>(async (res, rej) => {
      try {
        if (fetched !== id) {
          fetched = id;
          user = await client.users.fetch(id);
          if (!user) return rej("User does not exist.");
          profile = await user.fetchProfile();
        }
      } catch (err) {
        console.error(err);
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
      class="flex items-center w-full h-40 bg-cover bg-center px-5 relative"
      style:background-image={profile?.background
        ? `url(${proxyURL(profile.generateBackgroundURL({ max_side: 256 }) || "", "image")})`
        : ""}
      style:background-color={$Theme["secondary-background"]}
    >
      <div
        class="rounded-xl px-3 py-2 flex items-center gap-1.5"
        style:background-color={$Theme["background"]}
      >
        <div class="rounded-full w-14 h-14 relative bg-inherit">
          <img
            class="avatar rounded-full w-full h-full object-cover"
            src={UserDetails(user).avatar}
            alt={UserDetails(user).name}
          />
          <Indicator
            pos="bottomRight"
            color={$Theme[StatusColor(user)]}
            bg={$Theme["background"]}
            className="h-6 w-6 -right-0.5 -bottom-0.5"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <div class="font-semibold text-xl">{UserDetails(user).name}</div>
          {#if user.status}
            <div>{user.status}</div>
          {/if}
        </div>
      </div>
      <div class="ml-auto flex gap-2 items-center">
        {#if user.relationship !== RelationshipStatus.Self}
          {#if user.relationship == RelationshipStatus.SelfBlocked}
            <div class="brightness-50 cursor-not-allowed" style:color={$Theme["error"]}>
              <UserModalAction tooltip="Blocked" icon={IconBan} />
            </div>
          {:else if user.relationship == RelationshipStatus.Blocked}
            <UserModalAction tooltip="Unblock" icon={IconUserX} />
          {:else}
            <UserModalAction
              tooltip={user.relationship == RelationshipStatus.Friend
                ? "Remove Friend"
                : "Add Friend"}
              icon={user.relationship == RelationshipStatus.Friend ? IconUserMinus : IconUserPlus}
            />
          {/if}
          <UserModalAction icon={IconMessageShare} tooltip="Message" />
        {/if}
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
