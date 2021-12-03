import React from "react";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { FlexWrapper } from "../layout/FlexWrapper";

export const ConfirmModal: React.FC = () => {
	const { cancel, confirm } = useModalStore();
	const { t } = useTranslationStore();
	return (
		<div className="ConfirmModal">
			<p>{t("are_you_sure")}</p>
			<FlexWrapper>
				<button type="button" className="secondary" onClick={() => cancel()}>
					{t("cancel")}
				</button>
				<button type="button" className="primary" onClick={() => confirm()}>
					{t("confirm")}
				</button>
			</FlexWrapper>
		</div>
	);
};
