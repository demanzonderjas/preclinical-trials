import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const BooleanValue: React.FC<{ value: string }> = ({ value }) => {
	const { t } = useTranslationStore();
	return <>{t(value)}</>;
};
