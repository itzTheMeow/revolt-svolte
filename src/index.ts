import { client } from "Client";
import type { ClientSession } from "revolt-toolset";
import generateSplash from "splash";
import Login from "./Login.svelte";
//@ts-ignore
import App from "./index.svelte";
import "./style.css";

generateSplash();

const session = localStorage.getItem("session");

if (session) {
  new App({ target: document.body });
  const data = <ClientSession>JSON.parse(session);
  client.login(data.token, data.type || "user", true, data);
} else new Login({ target: document.body });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
