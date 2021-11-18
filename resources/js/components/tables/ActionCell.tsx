import React from "react";
import { Link } from "react-router-dom";
import { TProtocol } from "../../typings/protocols";

export const EditCell: React.FC<{ value: string; row: TProtocol }> = ({ value, row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/dashboard/edit-protocol/${row.id}`}>
				<button>Edit</button>
			</Link>
		</td>
	);
};
