import React from "react";
import { TProtocol } from "../../typings/protocols";
import { ProtocolCard } from "./ProtocolCard";

export const ProtocolCardsBlock: React.FC<{ protocols: TProtocol[] }> = ({ protocols }) => {
	return (
		<div className="CardsBlock">
			{protocols.map(p => (
				<ProtocolCard key={p.id} protocol={p} />
			))}
		</div>
	);
};
