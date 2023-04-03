<script lang="ts">
  import { IconBrandGithub, IconRobot, IconUser } from "@tabler/icons-svelte";
  import Loader from "Loader.svelte";
  import { Client } from "revolt-toolset";
  import { BRAND_COLOR } from "Theme";
  import { API_URL, BRAND_NAME, GIT_URL } from "utils";

  let signinBtn: HTMLDivElement,
    userInput: HTMLInputElement,
    passInput: HTMLInputElement,
    tokenInput: HTMLInputElement,
    mfaInput: HTMLInputElement;
  let errtxt = "",
    loginBot = false;

  async function signIn() {
    errtxt = "";
    const email = userInput.value,
      password = passInput.value,
      mfaToken = mfaInput.value,
      token = tokenInput.value;
    if (!token) {
      if (!email) return (errtxt = "Enter an email!");
      if (!password) return (errtxt = "Enter a password!");
    }

    signinBtn.classList.add("loading");
    const client = new Client({
      apiURL: API_URL,
    });
    client.once("ready", () => {
      localStorage.setItem("session", JSON.stringify(client.session));
      window.location.reload();
    });
    try {
      if (!token) {
        const loginResult = await client.authenticate({ email, password, friendly_name: `${BRAND_NAME}` });
        if (loginResult.type === "mfa") {
          if (!mfaToken) return errtxt = "Input your MFA token.";
          await client.authenticate({ mfa_ticket: loginResult.ticket, mfa_response: {
            totp_code: mfaToken,
          }});
        }
      }
      else await client.login(token, loginBot ? "bot" : "user");
    } catch (err) {
      errtxt = String(err);
      signinBtn.classList.remove("loading");
    }
  }

  let loaded = false,
    bg: HTMLImageElement;
</script>

<div class="w-screen h-screen">
  <img
    class="absolute top-0 left-0 w-full h-full object-cover blur-0 brightness-100 select-none"
    style:transition="all 500ms"
    src="https://images.unsplash.com/photo-1565120729227-86872732df92?w={window.innerWidth}"
    alt=""
    bind:this={bg}
    on:load={(e) => {
      loaded = true;
      setTimeout(() => {
        bg.style.setProperty("--tw-blur", "blur(2px)");
        bg.style.setProperty("--tw-brightness", "brightness(.85)");
        userInput.select();
      }, 10);
    }}
  />
  <div class="w-full h-full flex items-center flex-col justify-center relative">
    {#if loaded}
      <div
        class="flex gap-2 items-center self-start mb-auto w-full bg-black bg-opacity-40 backdrop-blur-md p-3 pr-5 select-none"
        style:color={BRAND_COLOR}
      >
        <img class="w-10 h-10" src="./logo.svg" alt="" />
        <div class="text-4xl font-[Nevis]">{BRAND_NAME}</div>
        <a class="ml-auto hover:brightness-75" href={GIT_URL} target="_blank" rel="noreferrer">
          <IconBrandGithub size={28} />
        </a>
      </div>
      <div
        class="rounded-xl relative flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-6 pt-12 pb-6 max-w-[90%] mb-auto"
      >
        <input
          type="email"
          class="input input-ghost input-bordered rounded-full w-72 max-w-full mb-2 bg-transparent backdrop-blur-[1px] focus:backdrop-blur-md ![outline:none]"
          placeholder="Email"
          bind:this={userInput}
          on:keydown={(e) => e.key == "Enter" && signIn()}
        />
        <input
          type="password"
          class="input input-ghost input-bordered rounded-full w-72 max-w-full bg-transparent backdrop-blur-[1px] focus:backdrop-blur-md ![outline:none]"
          placeholder="Password"
          bind:this={passInput}
          on:keydown={(e) => e.key == "Enter" && signIn()}
        />
        <input
          class="input input-ghost input-bordered rounded-full w-72 max-w-full mb-2 bg-transparent backdrop-blur-[1px] focus:backdrop-blur-md ![outline:none]"
          placeholder="MFA Code"
          bind:this={mfaInput}
          on:keydown={(e) => e.key == "Enter" && signIn()}
        />
        <div class="w-full text-center my-1">OR</div>
        <div class="input-group w-72 max-w-full mb-2">
          <input
            type="password"
            class="input input-ghost !rounded-l-full w-full input-bordered bg-transparent backdrop-blur-[1px] focus:backdrop-blur-md ![outline:none]"
            placeholder="Token"
            bind:this={tokenInput}
            on:keydown={(e) => e.key == "Enter" && signIn()}
          />
          <button
            class="btn btn-square !rounded-r-full"
            style:background={BRAND_COLOR}
            on:click={() => (loginBot = !loginBot)}
          >
            {#if loginBot}
              <IconRobot class="-ml-1" />
            {:else}
              <IconUser class="-ml-1" />
            {/if}
          </button>
        </div>
        {#if errtxt}
          <div class="text-error text-sm mt-2">{errtxt}</div>
        {/if}
        <div
          class="btn btn-primary {errtxt ? 'mt-2' : 'mt-4'} rounded-full border-none"
          bind:this={signinBtn}
          on:click={signIn}
          style:background-color={BRAND_COLOR}
        >
          Sign In
        </div>
      </div>
      <a
        class="self-end mb-2 mr-3 text-sm bg-gradient-to-br px-1.5 rounded-full from-purple-900 via-pink-600 to-orange-500 transition brightness-90 hover:brightness-75"
        href="https://unsplash.com/photos/e6BDUHBSP3E"
        target="_blank"
        rel="noreferrer"
      >
        Image by Sid Saxena on Unsplash
      </a>
    {:else}
      <Loader size={20} />
    {/if}
  </div>
</div>

<div class="hidden loading" />
