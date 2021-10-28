import React from "react";
import { LoginForm } from "../account/LoginForm";
import { Modal } from "../layout/Modal";

export const LoginModal: React.FC = () => {
	return (
		<Modal>
			<div className="LoginModal">
				<LoginForm />
			</div>
		</Modal>
	);
};
