import React from "react";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";
import { toggleBlockChannelQuery } from "../../queries/messages";
import { TChannel } from "../../typings/messages";
import { Slider } from "../base/Slider";

export const MessageActionCell: React.FC<{ value: string; row: TChannel }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { user } = useUser();

	return (
		<td className="ActionCell">
			<Link to={`/dashboard/messages/${row.id}`}>
				<button className="tertiary">View</button>
			</Link>
			{user && user.id === row.protocol_owner_id && (
				<div className="block">
					<span>{t("block")}</span>
					<Slider
						defaultValue={row.blocked}
						handleToggle={() => toggleBlockChannelQuery(row.id)}
					/>
				</div>
			)}
		</td>
	);
};
