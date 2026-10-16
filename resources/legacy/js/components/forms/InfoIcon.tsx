import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { Image } from "../base/Image";

export const InfoIcon: React.FC<{ info: string }> = ({ info }) => {
	const { t } = useTranslationStore();

	return (
		<div className="InfoIcon">
			<div className="icon">
				<Image filename="info.png" />
			</div>
			<div className="info" dangerouslySetInnerHTML={{ __html: t(info) }} />
		</div>
	);
};
