import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TProtocol } from "../../typings/protocols";
import { protocolMeetsFilters } from "../../utils/filters";

export const TotalMatchingFilters: React.FC<{ protocols: any[] }> = observer(({ protocols }) => {
	const { t } = useTranslationStore();
	const { activeFilterKey, activeFilterText, filters } = useFilter();
	const total = protocols.filter(p =>
		protocolMeetsFilters(activeFilterText, activeFilterKey, filters, p)
	).length;
	return (
		<div className="TotalMatchingFilters" style={{ display: "flex", fontSize: "18px" }}>
			<label>{t("total_found")}</label>
			<span style={{ marginLeft: "20px" }}>{total}</span>
		</div>
	);
});
