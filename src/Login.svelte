<script lang="ts">
  import { Client } from "revolt-toolset";

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
    const client = new Client();
    client.once("ready", () => {
      localStorage.setItem("session", JSON.stringify(client.session));
      window.location.reload();
    });
    try {
      await client.login({ email, password, friendly_name: "AncientRev" });
    } catch (err) {
      errtxt.innerText = `Failed to log in: ${err}`;
      signinBtn.classList.remove("loading");
    }
  }
</script>

<div class="flex items-center justify-center w-screen h-screen flex-col">
  <div class="text-lg mb-3">Log In</div>
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
