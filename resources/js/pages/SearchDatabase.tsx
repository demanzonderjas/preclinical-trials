import React, { useEffect, useState } from "react";
import { Image } from "../components/base/Image";
import { Page } from "../components/layout/Page";
import { Filter } from "../components/tables/Filter";
import { TableBlock } from "../components/tables/TableBlock";
import { FilterStoreProvider } from "../contexts/FilterStoreContext";
import { createProtocolForm } from "../data/forms/protocol";
import { searchProtocolsTable } from "../data/tables/protocols";
import { getViewableProtocolsQuery } from "../queries/protocol";
import { FilterStore } from "../stores/FilterStore";
import { TProtocolOverviewType } from "../typings/protocols";
import { mapProtocolDetailsToObject } from "../utils/formatting";

export const SearchDatabasePage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);
	const [overviewType, setOverviewType] = useState(TProtocolOverviewType.Table);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getViewableProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	return (
		<FilterStoreProvider store={filterStore}>
			<Page title="Search protocols">
				<div className="SearchDatabase border-top" style={{ background: "white" }}>
					<Filter
						options={createProtocolForm.fields
							.filter(f => f.useAsFilter)
							.map(f => f.id)}
					/>
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
					{overviewType === TProtocolOverviewType.Cards && <>cards</>}
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
