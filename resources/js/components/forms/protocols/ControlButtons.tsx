import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../../hooks/useForm";

export const ControlButtons: React.FC = observer(() => {
	const { isLastSection, form, goToNextSection } = useForm();

	return (
		<div className="ControlButtons">
			{!isLastSection && (
				<button onClick={goToNextSection}>Go to next section and save as draft</button>
			)}
			{!!isLastSection && <button type="submit">{form.submitText}</button>}
		</div>
	);
});
