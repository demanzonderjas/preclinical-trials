import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const TextCell: React.FC<{ value: string }> = ({ value }) => {
	const { t } = useTranslationStore();
	return <td className="TextCell">{t(value)}</td>;
};
