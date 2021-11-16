import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../../hooks/useForm";
import { saveProtocolQuery } from "../../../queries/protocol";
import { TFormFieldName } from "../../../typings/forms";

export const ControlButtons: React.FC = observer(() => {
	const { isLastSection, form, goToNextSection, createKeyValuePairs } = useForm();

	const saveAsDraft = e => {
		e.preventDefault();
		const data = createKeyValuePairs();
		saveProtocolQuery(data as { [K in TFormFieldName]: any });
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
