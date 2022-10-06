import dayjs from "dayjs";
import React from "react";
import { TDBProtocol, TProtocol } from "../../typings/protocols";

export const EmbargoDateCell: React.FC<{ value: string; row: TDBProtocol }> = ({ value, row }) => {
	console.log(row);
	return <td style={{ minWidth: "100px" }}>{row.embargo_end_date}</td>;
};
