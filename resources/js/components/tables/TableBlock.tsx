import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory } from "react-router";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TTable } from "../../typings/tables";
import { protocolMeetsFilters } from "../../utils/filters";
import cx from "classnames";

export const TableBlock: React.FC<{ table: TTable; rows: any[] }> = observer(
	({ table, rows = [] }) => {
		const { t } = useTranslationStore();
		const { activeFilterText, activeFilterKey, filters } = useFilter();
		const { push } = useHistory();
		const getMappedValue = (row: any, cellId: string, synonym: string) => {
			return row[cellId] || row[synonym];
		};

		if (!rows) {
			return null;
		}

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
								protocolMeetsFilters(
									activeFilterText,
									activeFilterKey,
									filters,
									row
								)
							)
							.map((row, idx) => (
								<tr
									key={idx}
									className={cx({ clickable: !!table.targetOnRowClick })}
									onClick={
										table.targetOnRowClick
											? () => push(`${table.targetOnRowClick}/${row.id}`)
											: undefined
									}
								>
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
	}
);
