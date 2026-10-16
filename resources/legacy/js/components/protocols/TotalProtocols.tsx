import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TProtocol } from "../../typings/protocols";
import { protocolMeetsFilters } from "../../utils/filters";

export const TotalProtocols: React.FC<{ protocols: TProtocol[] }> = observer(({ protocols }) => {
	const { activeFilterKey, activeFilterText, filters } = useFilter();
	const { t } = useTranslationStore();

	const totalProtocols = protocols.filter(row =>
		protocolMeetsFilters(activeFilterText, activeFilterKey, filters, row)
	);

	return (
		<div className="TotalProtocols layout-wrapper" style={{ textAlign: "center" }}>
			<h2 style={{ fontSize: "30px", fontWeight: "bold" }}>
				{t("matching_protocols")}: {totalProtocols.length}
			</h2>
		</div>
	);
});
