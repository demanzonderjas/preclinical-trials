import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const HTMLCell: React.FC<{ value: string; minWidth?: number }> = ({ value, minWidth }) => {
	const { t } = useTranslationStore();
	return (
		<td
			className="TextCell"
			style={{ minWidth: minWidth ? `${minWidth}px` : null }}
			dangerouslySetInnerHTML={{ __html: t(value) }}
		></td>
	);
};
