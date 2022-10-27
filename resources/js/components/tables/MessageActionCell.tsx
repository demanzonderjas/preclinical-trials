import React from "react";
import { Link } from "react-router-dom";
import { TChannel } from "../../typings/messages";

export const MessageActionCell: React.FC<{ value: string; row: TChannel }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/dashboard/messages/${row.id}`}>
				<button className="tertiary">View</button>
			</Link>
		</td>
	);
};
