import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { extendEmbargoForm } from "../../data/forms/embargo";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { extendEmbargoQuery, getEmbargoEndDateQuery } from "../../queries/embargo";
import { TEmbargoEndDate } from "../../typings/embargo";

export const ExtendEmbargoPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [embargoEndDate, setEmbargoEndDate] = useState<TEmbargoEndDate>(null);
	const { t } = useTranslationStore();

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getEmbargoEndDateQuery(protocol_id);
				setEmbargoEndDate(response.embargo_end_date);
			})();
		}
	}, [protocol_id]);

	const extendEmbargo = data => {
		return extendEmbargoQuery(protocol_id, data);
	};

	console.log(embargoEndDate);

	return (
		<Page title="Extend Embargo">
			<div className="EmbargoForm border-top">
				{embargoEndDate && (
					<>
						<FormBlock
							form={extendEmbargoForm}
							handleSubmit={extendEmbargo}
							icon="login.png"
						>
							<p className="margin-20">
								{t("embargo_demand")} {embargoEndDate.protocol.id}: "
								{embargoEndDate.protocol.title}"
							</p>
							<p className="margin-20">{t("tick_box")}</p>
						</FormBlock>
					</>
				)}
			</div>
		</Page>
	);
};
