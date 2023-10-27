import generateSplash from "pwasplash";
import type { ClientSession } from "revkit";
import { client } from "./Client";
import Login from "./Login.svelte";
//@ts-ignore
import { Native } from "Native";
import App from "./index.svelte";
import "./style.css";

if (!((<any>window).standalone || Native.isNative))
	generateSplash("./logo.png", {
		background: "#101823",
	});

const session = localStorage.getItem("session");

if (session) {
	new App({ target: document.body });
	const data = <ClientSession>JSON.parse(session);
	client.login(data.token, data.type || "user", true, data);
} else new Login({ target: document.body });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
