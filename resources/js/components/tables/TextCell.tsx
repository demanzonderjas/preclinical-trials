import React from "react";

export const TextCell: React.FC<{ value: string }> = ({ value }) => {
	return <td className="TextCell">{value}</td>;
};
