import dayjs from "dayjs";
import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TAdminAction, TDBProtocol } from "../../typings/protocols";

export const CommentsCell: React.FC<{ value: string; row: TDBProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const comments = row.comments || ([] as TAdminAction[]);

	return (
		<td className="CommentsCell">
			{comments.map(c => (
				<div className="comment" key={c.id}>
					<p className="message" dangerouslySetInnerHTML={{ __html: c.message }} />
					<div className="details">
						<span className="action">{t(c.action)}</span>
						<span className="date">{dayjs(c.created_at).format("DD/MM/YYYY")}</span>
					</div>
				</div>
			))}
		</td>
	);
};
