import { client } from "Client";
import type { ClientSession } from "revolt-toolset";
import App from "./index.svelte";
import Login from "./Login.svelte";
import "./style.css";

const session = localStorage.getItem("session");

if (session) {
  new App({ target: document.body });
  const data = <ClientSession>JSON.parse(session);
  client.login(data.token, data.type || "user", true, data);
} else new Login({ target: document.body });
