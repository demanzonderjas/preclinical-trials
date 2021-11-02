import { observer } from "mobx-react-lite";
import React from "react";
import { useModalStore } from "../../hooks/useModalStore";

export const Modal: React.FC = observer(() => {
	const { modal } = useModalStore();

	if (!modal) {
		return null;
	}

	return (
		<div className="ModalWrapper">
			<div className="Modal">
				<CloseIcon />
				<div className="ContentWrapper">
					<modal.Component />
				</div>
			</div>
		</div>
	);
});

export const CloseIcon: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className="CloseIcon"
			onClick={() => setModal(null)}
		>
			<path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z" />
		</svg>
	);
};
