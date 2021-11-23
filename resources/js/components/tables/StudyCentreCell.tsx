import React from "react";
import { TProtocol, TStudyCentre } from "../../typings/protocols";

export const StudyCentreCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const hasCentre = row.study_centre as TStudyCentre;
	return <td className="StudyCentreCell">{!!hasCentre && row.study_centre[0].name}</td>;
};
