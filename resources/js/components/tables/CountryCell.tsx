import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getCountries } from "../../utils/countries";

export const CountryCell: React.FC<{ value: string }> = ({ value }) => {
	return <td className="TextCell">{getCountries()[value]}</td>;
};
