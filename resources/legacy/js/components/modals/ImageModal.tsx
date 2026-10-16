import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ImageModal: React.FC<{ data: { src: string } }> = ({ data }) => {
	const { t } = useTranslationStore();

	return (
		<div className="ImageModal">
			<img src={data.src} />
			<a href={data.src} target="_blank" rel="noopener noreferrer">
				{t("open_image_in_new_tab")}
			</a>
		</div>
	);
};
