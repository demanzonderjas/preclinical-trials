import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const SuccessMessage: React.FC = observer(() => {
	const { succesText, isDone } = useForm();
	const { t } = useTranslationStore();

	if (!succesText || !isDone) {
		return null;
	}

	return <div className="SuccessMessage">{t(succesText)}</div>;
});
