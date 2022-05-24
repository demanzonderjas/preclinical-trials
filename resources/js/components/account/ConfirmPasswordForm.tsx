import React, { useState } from "react";
import { FormBlock } from "../layout/FormBlock";
import { confirmPasswordForm } from "../../data/forms/login";
import { confirmPasswordQuery } from "../../queries/login";
import { observer } from "mobx-react-lite";
import { useUser } from "../../hooks/useUser";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useModalStore } from "../../hooks/useModalStore";

export const ConfirmPasswordForm: React.FC = observer(() => {
	const { user } = useUser();
	const { t } = useTranslationStore();
	const { confirm } = useModalStore();
	const [error, setError] = useState(false);

	const handleSubmit = async ({ password }) => {
		setError(false);
		const isConfirmed = await confirmPasswordQuery({ password, email: user.email });
		if (isConfirmed) {
			confirm();
		} else {
			setError(true);
		}
	};

	return (
		<FormBlock icon="password.png" form={confirmPasswordForm} handleSubmit={handleSubmit}>
			<div className="ConfirmPasswordForm">
				<h3>{t("confirm_password")}</h3>
			</div>
			{error && <p className="error">{t("password_is_incorrect")}</p>}
		</FormBlock>
	);
});
