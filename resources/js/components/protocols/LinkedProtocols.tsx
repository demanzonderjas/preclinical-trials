import React from "react";
import { TProtocol } from "../../typings/protocols";

export function LinkedProtocols({ protocols }: { protocols: TProtocol[] }) {
	if (!protocols) {
		return null;
	}
	return (
		<ul>
			{protocols.map(p => (
				<li key={p.id}>
					<a href={`/database/view-protocol/${p.id}`}>
						{p.title} ({p.pct_id})
					</a>
				</li>
			))}
		</ul>
	);
}
