import React from "react";

export const Subtitle: React.FC<{ text: string }> = ({ text }) => {
	return (
		<div className="Subtitle">
			<h2>{text}</h2>
		</div>
	);
};
