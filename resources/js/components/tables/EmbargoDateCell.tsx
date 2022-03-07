import dayjs from "dayjs";
import React from "react";
import { TDBProtocol, TProtocol } from "../../typings/protocols";

export const EmbargoDateCell: React.FC<{ value: string; row: TDBProtocol }> = ({ value, row }) => {
	return (
		<td>
			{dayjs(row.created_at)
				.add(1, "year")
				.format("DD/MM/YYYY")}
		</td>
	);
};
