import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TTable } from "../../typings/tables";
import { protocolMeetsFilters } from "../../utils/filters";

export const TableBlock: React.FC<{ table: TTable; rows: any[] }> = observer(({ table, rows }) => {
	const { t } = useTranslationStore();
	const { activeFilterText, activeFilterKey, filters } = useFilter();
	const getMappedValue = (row: any, cellId: string, synonym: string) => {
		return row[cellId] || row[synonym];
	};

	return (
		<div className="TableBlock">
			<table>
				<thead>
					<tr>
						{table.headers.map(header => (
							<th key={header}>{t(header)}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows
						.filter(row =>
							protocolMeetsFilters(activeFilterText, activeFilterKey, filters, row)
						)
						.map(row => (
							<tr key={row.id}>
								{table.cells.map(cell => (
									<cell.Component
										key={cell.id}
										row={row}
										value={getMappedValue(row, cell.id, cell.synonym)}
									/>
								))}
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
});
