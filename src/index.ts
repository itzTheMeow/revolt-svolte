import { client } from "Client";
import App from "./index.svelte";
import Login from "./Login.svelte";
import "./style.css";

const session = localStorage.getItem("session");

if (session) {
  new App({ target: document.body });
  client.useExistingSession(JSON.parse(session));
} else new Login({ target: document.body });
