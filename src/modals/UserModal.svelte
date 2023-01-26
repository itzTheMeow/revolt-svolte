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
  import { AppWidth, MobileLayout, SelectedChannel, SelectedServer } from "State";
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
        class="flex {$MobileLayout
          ? 'flex-col justify-center'
          : ''} items-center w-full h-40 bg-cover bg-center px-6 relative"
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
          class="{$MobileLayout
            ? 'max-w-full'
            : 'max-w-[calc(100%-8rem)]'} rounded-xl px-3 py-2 flex items-center gap-2 shadow-md shadow-black overflow-hidden"
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
          <table class="flex-1 overflow-hidden table-fixed w-min">
            <tr>
              <th
                class="p-0 w-min font-semibold text-xl overflow-hidden whitespace-nowrap overflow-ellipsis"
                style:max-width={$MobileLayout ? "60vw" : `${($AppWidth / 2) * 0.55}px`}
              >
                {UserDetails(user).name}
              </th>
            </tr>
            {#if user.status}
              <tr>
                <td class="p-0 text-sm overflow-hidden whitespace-nowrap overflow-ellipsis w-min">
                  {user.status}
                </td>
              </tr>
            {/if}
          </table>
        </div>
        <div class="{$MobileLayout ? 'mt-3' : 'ml-auto'} flex gap-2 items-center">
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
                if (dm) {
                  item.close();
                  SelectedServer.set(null);
                  SelectedChannel.set(dm);
                }
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
