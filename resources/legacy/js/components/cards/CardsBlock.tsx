import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { TNewsItem } from "../../typings/news";
import { TProtocol } from "../../typings/protocols";
import { newsItemMeetsFilters, protocolMeetsFilters } from "../../utils/filters";
import { NewsItemCard } from "./NewsItemCard";
import { ProtocolCard } from "./ProtocolCard";

export const ProtocolCardsBlock: React.FC<{ protocols: TProtocol[] }> = observer(
	({ protocols }) => {
		const { activeFilterText, activeFilterKey, filters } = useFilter();
		return (
			<div className="CardsBlock layout-wrapper">
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

export const NewsCardsBlock: React.FC<{ newsItems: TNewsItem[] }> = observer(({ newsItems }) => {
	const { activeFilterText, activeFilterKey, filters } = useFilter();
	return (
		<div className="CardsBlock layout-wrapper">
			{newsItems
				.filter(row =>
					newsItemMeetsFilters(activeFilterText, activeFilterKey, filters, row)
				)
				.map(item => (
					<NewsItemCard key={item.id} {...item} />
				))}
		</div>
	);
});
