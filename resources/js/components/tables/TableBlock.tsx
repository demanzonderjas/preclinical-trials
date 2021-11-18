import React from "react";
import { TTable } from "../../typings/tables";

export const TableBlock: React.FC<{ table: TTable; rows: any[] }> = ({ table, rows }) => {
	const getMappedValue = (row: any, cellId: string, synonym: string) => {
		return row[cellId] || row[synonym];
	};

	return (
		<div className="TableBlock">
			<table>
				<thead>
					<tr>
						{table.headers.map(header => (
							<th key={header}>{header}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
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
};
