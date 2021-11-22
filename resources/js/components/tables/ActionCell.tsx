import React from "react";
import { Link } from "react-router-dom";
import { TProtocol } from "../../typings/protocols";

export const ActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/dashboard/edit-protocol/${row.id}`}>
					<button>Edit</button>
				</Link>
				<Link to={`/database/view-protocol/${row.id}`}>
					<button className="tertiary">View</button>
				</Link>
			</div>
		</td>
	);
};

export const EditCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/dashboard/edit-protocol/${row.id}`}>
				<button>Edit</button>
			</Link>
		</td>
	);
};

export const ViewCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/database/view-protocol/${row.id}`}>
				<button className="tertiary">View</button>
			</Link>
		</td>
	);
};
