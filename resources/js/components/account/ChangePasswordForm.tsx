import React, { useState } from "react";
import { FormBlock } from "../layout/FormBlock";
import { changePasswordForm } from "../../data/forms/login";
import { changePasswordQuery, confirmPasswordQuery } from "../../queries/login";
import { observer } from "mobx-react-lite";
import { useUser } from "../../hooks/useUser";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ChangePasswordForm: React.FC = observer(() => {
	const { user } = useUser();
	const { t } = useTranslationStore();
	const [error, setError] = useState(false);
	const [isSuccess, setIsSuccess] = useState(null);

	const handleSubmit = async ({ current_password, password, password_confirmation }) => {
		setError(false);
		setIsSuccess(false);
		const isConfirmed = await confirmPasswordQuery({
			password: current_password,
			email: user.email
		});
		if (!isConfirmed) {
			setError(true);
			return;
		}

		const isSuccess = await changePasswordQuery({
			password,
			password_confirmation,
			email: user.email
		});

		if (isSuccess) {
			setIsSuccess(true);
		} else {
			setIsSuccess(false);
		}
	};

	return (
		<FormBlock icon="password.png" form={changePasswordForm} handleSubmit={handleSubmit}>
			<div className="ChangePassword">
				<h3>{t("change_password")}</h3>
			</div>
			{error && <p className="error">{t("password_is_incorrect")}</p>}
			{isSuccess && <p className="success">{t("password_changed_succesfully")}</p>}
			{isSuccess === false && <p className="error">{t("password_could_not_be_changed")}</p>}
		</FormBlock>
	);
});
