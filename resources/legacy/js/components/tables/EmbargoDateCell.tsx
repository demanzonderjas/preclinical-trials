import React from "react";
import { TDBProtocol } from "../../typings/protocols";

export const EmbargoDateCell: React.FC<{ value: string; row: TDBProtocol }> = ({ value, row }) => {
	return <td style={{ minWidth: "100px" }}>{row.embargo_end_date}</td>;
};
