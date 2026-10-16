import React from "react";

export const FlexWrapper: React.FC = ({ children }) => {
	return (
		<div
			className="FlexWrapper"
			style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
		>
			{children}
		</div>
	);
};
