import React, { useEffect, useState } from "react";
import { Image } from "../components/base/Image";
import { ProtocolCardsBlock } from "../components/cards/CardsBlock";
import { Page } from "../components/layout/Page";
import { TotalProtocols } from "../components/protocols/TotalProtocols";
import { Filter } from "../components/tables/Filter";
import { TableBlock } from "../components/tables/TableBlock";
import { FilterStoreProvider } from "../contexts/FilterStoreContext";
import { pctIdField } from "../data/forms/fields/protocol/id";
import { createProtocolForm } from "../data/forms/protocol";
import { searchProtocolsTable } from "../data/tables/protocols";
import { getViewableProtocolsQuery } from "../queries/protocol";
import { FilterStore } from "../stores/FilterStore";
import { TProtocol, TProtocolOverviewType } from "../typings/protocols";
import { mapProtocolDetailsToObject } from "../utils/formatting";

export const SearchDatabasePage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);
	const [overviewType, setOverviewType] = useState(TProtocolOverviewType.Table);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getViewableProtocolsQuery();
			const targetProtocols: TProtocol[] = response.protocols
				.map(mapProtocolDetailsToObject)
				.filter((p: TProtocol) => !!p.title);
			setProtocols(targetProtocols);
		})();
	}, []);

	return (
		<FilterStoreProvider store={filterStore}>
			<Page title="Search protocols">
				<div className="SearchDatabase border-top" style={{ background: "white" }}>
					<Filter
						options={[
							pctIdField,
							...createProtocolForm.fields.filter(f => f.useAsFilter)
						].map(f => f.filterLabel || f.id)}
					/>
					<TotalProtocols protocols={protocols} />
					<div
						className="OverviewSwitch layout-wrapper"
						style={{ display: "flex", justifyContent: "right" }}
					>
						<div
							className="icon-wrapper"
							style={{
								width: "60px",
								marginRight: "10px",
								cursor: "pointer",
								opacity: overviewType === TProtocolOverviewType.Cards ? 1 : 0.5
							}}
						>
							<Image
								filename="OverviewIconCard.png"
								handleClick={() => setOverviewType(TProtocolOverviewType.Cards)}
							/>
						</div>
						<div
							className="icon-wrapper"
							style={{
								width: "40px",
								cursor: "pointer",
								opacity: overviewType === TProtocolOverviewType.Table ? 1 : 0.5
							}}
						>
							<Image
								filename="OverviewIconTable.png"
								handleClick={() => setOverviewType(TProtocolOverviewType.Table)}
							/>
						</div>
					</div>
					{overviewType === TProtocolOverviewType.Table && (
						<TableBlock table={searchProtocolsTable} rows={protocols} />
					)}
					{overviewType === TProtocolOverviewType.Cards && (
						<ProtocolCardsBlock protocols={protocols} />
					)}
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
