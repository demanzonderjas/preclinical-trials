import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { createProtocolForm } from "../../data/forms/protocol";
import { getProtocolQuery, saveProtocolQuery } from "../../queries/protocol";
import { TSectionName } from "../../typings/forms";
import { TProtocol } from "../../typings/protocols";

export const EditProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState(null);

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				const data = response.protocol as TProtocol;
				setProtocol(data);
			})();
		}
	}, [protocol_id]);

	return (
		<Page title="Edit Protocol">
			<div className="AddProtocol border-top">
				<FormBlock
					form={createProtocolForm}
					waitForData={true}
					initialData={protocol?.details}
					handleSubmit={saveProtocolQuery}
					icon="add.png"
					sections={[
						TSectionName.General,
						TSectionName.StudyDesign,
						TSectionName.ContactDetails,
						TSectionName.StudyCentreDetails,
						TSectionName.Submit
					]}
				>
					<p className="intro">
						Register your study by completing the following form. Notice that the fields
						with an asterisk are mandatory, whereas other fields are optional. Once the
						form is submitted it will be checked before publication on this website.
						Changes made after publication on this site will be recorded with an audit
						trail.
					</p>
				</FormBlock>
			</div>
		</Page>
	);
};
