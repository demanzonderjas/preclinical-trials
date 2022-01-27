import React from "react";

export const Triangle: React.FC = () => {
	return (
		<svg
			height="150px"
			width="100%"
			viewBox="0 0 500 500"
			preserveAspectRatio="none"
			style={{ background: "#83b2ba" }}
		>
			<polygon points="0,0 500,500 0,500 0,0" fill="white" />
		</svg>
	);
};
