import type { Server } from "revkit";
import { writable } from "svelte/store";
import { client } from "../Client";
import { ServerOrder } from "../State";

export const OrderedServers = writable<Server[]>([]);

function update(order: string[]) {
	OrderedServers.update(() => {
		return <Server[]>(
			[
				...order.map((s) => client.servers.get(s)),
				...client.servers.filter((s) => !order.includes(s.id)),
			].filter((o) => o)
		);
	});
}

ServerOrder.subscribe(update);
client.servers.onUpdate(() => ServerOrder.update((o) => o));
