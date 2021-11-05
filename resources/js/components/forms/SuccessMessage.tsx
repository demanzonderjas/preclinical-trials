import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../hooks/useForm";

export const SuccessMessage: React.FC = observer(() => {
	const { succesText, isDone } = useForm();

	if (!succesText || !isDone) {
		return null;
	}

	return <div className="SuccessMessage">{succesText}</div>;
});
