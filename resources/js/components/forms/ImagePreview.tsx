import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ImagePreview: React.FC<{ src: string; onDelete: () => void }> = ({
	src,
	onDelete
}) => {
	const { t } = useTranslationStore();

	return (
		<div className="preview">
			<div className="image-wrapper">
				<img src={src} />
				<div className="overlay">
					<button type="button" className="small delete danger" onClick={onDelete}>
						{t("delete")}
					</button>
				</div>
			</div>
		</div>
	);
};
