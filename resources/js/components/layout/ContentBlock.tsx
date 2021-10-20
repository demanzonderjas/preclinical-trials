import React from "react";

export const ContentBlock: React.FC = ({ children }) => {
	return (
		<div className="ContentBlock">
			<div className="content">{children}</div>
		</div>
	);
};
