import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { TProtocol } from "../../typings/protocols";
import { protocolMeetsFilters } from "../../utils/filters";
import { ProtocolCard } from "./ProtocolCard";

export const ProtocolCardsBlock: React.FC<{ protocols: TProtocol[] }> = observer(
	({ protocols }) => {
		const { activeFilterText, activeFilterKey, filters } = useFilter();
		return (
			<div className="CardsBlock">
				{protocols
					.filter(row =>
						protocolMeetsFilters(activeFilterText, activeFilterKey, filters, row)
					)
					.map(p => (
						<ProtocolCard key={p.id} protocol={p} />
					))}
			</div>
		);
	}
);
