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
  import { MobileLayout, SelectedChannel } from "State";
  import { onDestroy } from "svelte";
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

  let state = Date.now();
  function handleState() {
    state = Date.now();
  }
  $: {
    if (user) {
      user.offUpdate(handleState);
      user.onUpdate(handleState);
    }
  }
  onDestroy(() => {
    user.offUpdate(handleState);
  });
</script>

<ModalBase
  {modal}
  bind:item
  full={$MobileLayout}
  className="p-0 overflow-hidden {$MobileLayout ? '' : 'max-w-none w-1/2 h-2/3'}"
>
  {#key state}
    {#await fetch(modal.id)}
      <div class="w-full h-full flex items-center justify-center"><Loader /></div>
    {:then _}
      <div
        class="flex items-center w-full h-40 bg-cover bg-center px-6 relative"
        style:background-image={profile?.background
          ? `url(${proxyURL(
              profile.generateBackgroundURL({
                max_side: Math.round($MobileLayout ? window.innerWidth : window.innerWidth / 2),
              }) || "",
              "image"
            )})`
          : ""}
        style:background-color={$Theme["secondary-background"]}
      >
        <div
          class="rounded-xl px-3 py-2 flex items-center gap-2 max-w-[50%] shadow-sm"
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
          <div class="flex flex-col">
            <div class="font-semibold text-xl overflow-hidden whitespace-nowrap overflow-ellipsis">
              {UserDetails(user).name}
            </div>
            {#if user.status}
              <div class="text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
                {user.status}
              </div>
            {/if}
          </div>
        </div>
        <div class="ml-auto flex gap-2 items-center">
          {#if user.relationship !== RelationshipStatus.Self}
            {#if !user.bot}
              {#if user.relationship == RelationshipStatus.SelfBlocked}
                <UserModalAction
                  tooltip="User has blocked you."
                  icon={IconBan}
                  onclick={() => {}}
                  className="brightness-50 hover:!brightness-500 !cursor-not-allowed"
                  color={$Theme["error"]}
                />
              {:else if user.relationship == RelationshipStatus.Blocked}
                <UserModalAction
                  tooltip="Unblock"
                  icon={IconUserX}
                  onclick={() => user.unblock()}
                />
              {:else if user.relationship == RelationshipStatus.Outgoing}
                <UserModalAction
                  tooltip="Cancel Outgoing Request"
                  icon={IconX}
                  onclick={() => user.removeFriend()}
                />
              {:else}
                <UserModalAction
                  tooltip={user.relationship == RelationshipStatus.Friend
                    ? "Remove Friend"
                    : user.relationship == RelationshipStatus.Incoming
                    ? "Accept Friend Request"
                    : "Add Friend"}
                  icon={user.relationship == RelationshipStatus.Friend
                    ? IconUserMinus
                    : IconUserPlus}
                  onclick={() =>
                    user.relationship == RelationshipStatus.Friend
                      ? user.removeFriend()
                      : user.addFriend()}
                  color={user.relationship == RelationshipStatus.Incoming
                    ? $Theme["success"]
                    : "inherit"}
                />
              {/if}
            {/if}
            <UserModalAction
              icon={IconMessageShare}
              tooltip="Message"
              onclick={async () => {
                const dm = await user.openDM();
                if (dm) SelectedChannel.set(dm);
              }}
            />
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
  {/key}
</ModalBase>
