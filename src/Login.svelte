<script lang="ts">
  import Loader from "Loader.svelte";
  import { Client } from "revolt-toolset";
  import { BrandGithub } from "tabler-icons-svelte";
  import { BRAND_COLOR } from "Theme";
  import { API_URL, BRAND_NAME, GIT_URL } from "utils";

  let signinBtn: HTMLDivElement;
  let userInput: HTMLInputElement;
  let passInput: HTMLInputElement;
  let errtxt: HTMLDivElement;

  async function signIn() {
    errtxt.innerHTML = "";
    const email = userInput.value,
      password = passInput.value;
    if (!email) return (errtxt.innerText = "Enter an email!");
    if (!password) return (errtxt.innerText = "Enter a password!");

    signinBtn.classList.add("loading");
    const client = new Client({
      apiURL: API_URL,
    });
    client.once("ready", () => {
      localStorage.setItem("session", JSON.stringify(client.session));
      window.location.reload();
    });
    try {
      await client.authenticate({ email, password, friendly_name: `${BRAND_NAME}` });
    } catch (err) {
      errtxt.innerText = `Failed to log in: ${err}`;
      signinBtn.classList.remove("loading");
    }
  }

  let loaded = false;
</script>

<div class="w-screen h-screen">
  <img
    class="absolute top-0 left-0 w-full h-full object-cover blur-0 brightness-100 select-none"
    style:transition="all 500ms"
    src="https://images.unsplash.com/photo-1565120729227-86872732df92?w={window.innerWidth}"
    alt=""
    on:load={(e) => {
      loaded = true;
      setTimeout(() => {
        //@ts-ignore
        e.target.style.setProperty("--tw-blur", "blur(2px)");
        //@ts-ignore
        e.target.style.setProperty("--tw-brightness", "brightness(.85)");
      }, 10);
    }}
  />
  <div class="w-full h-full flex items-center flex-col justify-center relative">
    {#if loaded}
      <div
        class="flex gap-2 items-center self-start mb-auto w-full bg-black bg-opacity-40 backdrop-blur-md p-3 pr-5 select-none"
        style:color={BRAND_COLOR}
      >
        <img class="w-10 h-10" src="/logo.png" alt="" />
        <div class="text-4xl font-[Nevis]">{BRAND_NAME}</div>
        <a class="ml-auto hover:brightness-75" href={GIT_URL} target="_blank">
          <BrandGithub size={28} />
        </a>
      </div>
      <div
        class="rounded-xl relative flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 mb-auto"
      >
        <input
          type="email"
          class="input input-bordered w-72 mb-2"
          placeholder="Email"
          bind:this={userInput}
        />
        <input
          type="password"
          class="input input-bordered w-72 mb-2"
          placeholder="Password"
          bind:this={passInput}
        />
        <div class="text-error text-sm" bind:this={errtxt} />
        <div class="btn btn-primary mt-2" bind:this={signinBtn} on:click={signIn}>Sign In</div>
      </div>
      <a
        class="self-end mb-2 mr-3 text-sm bg-gradient-to-br px-1.5 rounded-full from-purple-900 via-pink-600 to-orange-500 transition brightness-90 hover:brightness-75"
        href="https://unsplash.com/photos/e6BDUHBSP3E"
        target="_blank"
      >
        Image by Sid Saxena on Unsplash
      </a>
    {:else}
      <Loader size={20} />
    {/if}
  </div>
</div>
