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
import { searchProtocolsTable, selectProtocolsTable } from "../data/tables/protocols";
import { getViewableProtocolsQuery } from "../queries/protocol";
import { FilterStore } from "../stores/FilterStore";
import { TProtocol, TProtocolOverviewType } from "../typings/protocols";
import { mapProtocolDetailsToObject } from "../utils/formatting";
import { useTranslationStore } from "../hooks/useTranslationStore";
import { toggle } from "../utils/arrays";
import { exportProtocolsToExcel } from "../utils/excel";
import { useUser } from "../hooks/useUser";

export const SearchDatabasePage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);
	const [overviewType, setOverviewType] = useState(TProtocolOverviewType.Table);
	const [isSelectingForExport, setIsSelectingForExport] = useState(false);
	const [selectedProtocols, setSelectedProtocols] = useState([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();
	const { user } = useUser();

	useEffect(() => {
		(async () => {
			const response = await getViewableProtocolsQuery();
			const targetProtocols: TProtocol[] = response.protocols
				.map(mapProtocolDetailsToObject)
				.filter((p: TProtocol) => !!p.title);
			setProtocols(targetProtocols);
		})();
	}, []);

	async function exportProtocols() {
		const columnsToExclude = [
			"why_amendment",
			"embargo_end_date",
			"comments",
			"has_embargo",
			"statement_of_accuracy"
		];

		const columnsWithObjects = ["financial_support", "study_arms", "study_centre"];

		const protocolsToExport = selectedProtocols.map(id => {
			const protocol = protocols.find(p => p.id == id);
			const copy = { ...protocol };
			Object.keys(copy).forEach(column => {
				if (columnsToExclude.includes(column)) {
					delete copy[column];
				} else if (columnsWithObjects.includes(column)) {
					copy[column] = JSON.stringify(copy[column]);
				} else {
					copy[column] = t(copy[column]);
				}
			});
			return copy;
		});

		await exportProtocolsToExcel(protocolsToExport);
	}

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
					{!!user && (
						<div
							className="margin-1 layout-wrapper"
							style={
								isSelectingForExport
									? {
											position: "sticky",
											padding: "10px 0",
											top: "0px",
											backgroundColor: "#fff"
									  }
									: {}
							}
						>
							<button
								className="tertiary small margin-10"
								onClick={() => {
									setIsSelectingForExport(!isSelectingForExport);
									setSelectedProtocols([]);
								}}
							>
								{t(isSelectingForExport ? "deselect_all" : "select_for_export")}
							</button>
							{!!isSelectingForExport && !!selectedProtocols.length && (
								<div className="margin-10">
									<button className="secondary small" onClick={exportProtocols}>
										{t("export_protocols")}
									</button>
								</div>
							)}
						</div>
					)}
					<div className="layout-wrapper">
						{overviewType === TProtocolOverviewType.Table && (
							<TableBlock
								table={
									isSelectingForExport
										? {
												...selectProtocolsTable,
												targetOnRowClick: id =>
													setSelectedProtocols(
														toggle(selectedProtocols, id)
													)
										  }
										: searchProtocolsTable
								}
								rows={protocols.map(p => ({
									...p,
									selected: selectedProtocols.includes(p.id)
								}))}
							/>
						)}
						{overviewType === TProtocolOverviewType.Cards && (
							<ProtocolCardsBlock protocols={protocols} />
						)}
					</div>
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
