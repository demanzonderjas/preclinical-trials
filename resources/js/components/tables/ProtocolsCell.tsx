import dayjs from "dayjs";
import React from "react";
import { TUser } from "../../typings/auth";
import { TDBProtocol } from "../../typings/protocols";
import { mapProtocolDetailsToObject } from "../../utils/formatting";

export const ProtocolsCell: React.FC<{
	value: string;
	row: TUser & { protocols: TDBProtocol[] };
}> = ({ row }) => {
	const protocols =
		row.protocols.map(mapProtocolDetailsToObject) || (([] as TDBProtocol[]) as any);

	return (
		<td className="CommentsCell">
			{protocols.map(p => (
				<div
					className="comment"
					key={p.id}
					style={{ cursor: "pointer" }}
					onClick={() => window.open(`/admin/protocols/${p.id}`, "_blank")}
				>
					<p className="message" dangerouslySetInnerHTML={{ __html: p.title }} />
					<div className="details">
						<span className="action">{p.status}</span>
						<span className="date">{dayjs(p.created_at).format("DD/MM/YYYY")}</span>
					</div>
				</div>
			))}
		</td>
	);
};
