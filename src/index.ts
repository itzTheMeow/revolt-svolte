import { client } from "Client";
import App from "./index.svelte";
import Login from "./Login.svelte";
import "./style.css";

const session = localStorage.getItem("session");

if (session) {
  new App({ target: document.body });
  const { token, type } = JSON.parse(session);
  client.login(token, type);
} else new Login({ target: document.body });
