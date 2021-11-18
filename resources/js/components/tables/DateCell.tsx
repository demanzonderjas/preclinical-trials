import dayjs from "dayjs";
import React from "react";

export const DateCell: React.FC<{ value: string }> = ({ value }) => {
	return <td>{dayjs(value).format("DD/MM/YYYY")}</td>;
};
