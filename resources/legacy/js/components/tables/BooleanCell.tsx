import React from "react";

import { BooleanValue } from "../layout/BooleanValue";

export const BooleanCell: React.FC<{ value: string }> = ({ value }) => {
	return (
		<td className="BooleanCell">
			<BooleanValue value={value} />
		</td>
	);
};
