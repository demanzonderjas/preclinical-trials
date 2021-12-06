import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TProtocol } from "../../typings/protocols";
import day from "dayjs";
import { useHistory } from "react-router";

export const ProtocolCard: React.FC<{ protocol: TProtocol }> = ({ protocol }) => {
	const { t } = useTranslationStore();
	const { push } = useHistory();
	return (
		<div className="card-wrapper">
			<div
				className="ProtocolCard card"
				onClick={() => push(`/database/view-protocol/${protocol.id}`)}
			>
				<div className="figure"></div>
				<div className="header">
					<p>{protocol.title}</p>
				</div>
				<div className="body">
					<p>{protocol.hypothesis}</p>
				</div>
				<div className="footer">
					<div className="start-date date">
						<span>{day(protocol.start_date).format("D MMM YYYY")}</span>
					</div>
					<div className="status">
						<span>{t(protocol.study_status)}</span>
					</div>
					<div className="end-date date">
						<span>{day(protocol.end_date).format("D MMM YYYY")}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
