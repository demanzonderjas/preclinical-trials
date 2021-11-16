import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router";
import { useForm } from "../../../hooks/useForm";
import { saveProtocolQuery, updateProtocolQuery } from "../../../queries/protocol";
import { TProtocol } from "../../../typings/protocols";

export const ControlButtons: React.FC = observer(() => {
	const { isLastSection, form, goToNextSection, createKeyValuePairs } = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();

	const saveAsDraft = e => {
		e.preventDefault();
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
		} else {
			saveProtocolQuery(data);
		}
		goToNextSection(e);
	};

	return (
		<div className="ControlButtons">
			{!isLastSection && (
				<button onClick={saveAsDraft}>Go to next section and save as draft</button>
			)}
			{!!isLastSection && <button type="submit">{form.submitText}</button>}
		</div>
	);
});
