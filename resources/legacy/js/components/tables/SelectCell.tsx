import React from "react";

export const SelectCell: React.FC<{ value: boolean }> = ({ value }) => {
	return (
		<td className="SelectCell">
			<input key={`${value}`} type="checkbox" defaultChecked={value} />
		</td>
	);
};
