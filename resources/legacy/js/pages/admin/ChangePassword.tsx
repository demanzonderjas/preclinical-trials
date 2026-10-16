import React from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { FormBlock } from "../../components/layout/FormBlock";
import { changePasswordAsAdminForm } from "../../data/forms/login";
import { changePasswordAsAdminQuery } from "../../queries/admin";

export const ChangePasswordPage: React.FC = () => {
	function generatePassword() {
		let length = 16,
			charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			retVal = "";
		for (let i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		return retVal;
	}

	const randomPassword = generatePassword();

	return (
		<AdminPage title="Change password">
			<div className="form">
				<FormBlock
					form={changePasswordAsAdminForm}
					handleSubmit={changePasswordAsAdminQuery}
					initialData={[
						{ key: "password", value: randomPassword },
						{ key: "password_confirmation", value: randomPassword }
					]}
				></FormBlock>
			</div>
		</AdminPage>
	);
};
