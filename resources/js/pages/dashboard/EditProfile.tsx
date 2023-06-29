import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory } from "react-router-dom";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { editAccountForm } from "../../data/forms/create-account";
import { changePasswordModal, confirmPasswordModal } from "../../data/modals/loginModal";
import { useModalStore } from "../../hooks/useModalStore";
import { useUser } from "../../hooks/useUser";
import { updateProfileQuery } from "../../queries/account";
import { TSavedFormValue } from "../../typings/forms";

export const EditProfilePage: React.FC = observer(() => {
	const { user } = useUser();
	const { setModal } = useModalStore();
	const { push } = useHistory();

	const handleSubmit = data => {
		setModal({ ...confirmPasswordModal, actionOnConfirm: () => updateProfileQuery(data) });
	};

	if (!user) {
		return null;
	}

	const initialData: TSavedFormValue[] = editAccountForm.fields.map(field => ({
		key: field.id,
		value: user[field.id]
	}));

	return (
		<Page title="Edit profile">
			<div className="EditProfile border-top">
				<div
					className="layout-wrapper"
					style={{
						display: "flex",
						justifyContent: "flex-end",
						width: "750px",
						maxWidth: "100%",
						margin: "40px auto -60px"
					}}
				>
					<div
						style={{
							maxWidth: "200px",
							textAlign: "right",
							height: "80px",
							display: "flex",
							justifyContent: "space-between",
							flexDirection: "column",
							alignItems: "right"
						}}
					>
						<button
							className="tertiary small"
							onClick={() => push("/dashboard/profile")}
						>
							Back to profile
						</button>
						<button
							className="secondary small"
							onClick={() => setModal(changePasswordModal)}
						>
							Change password
						</button>
					</div>
				</div>
				<FormBlock
					icon="edit.png"
					form={editAccountForm}
					handleSubmit={handleSubmit}
					initialData={initialData}
				>
					<p className="intro">
						Here you can change the info connected to your account. To confirm the
						changes, you will need to re-enter your current password.
					</p>
				</FormBlock>
			</div>
		</Page>
	);
});
