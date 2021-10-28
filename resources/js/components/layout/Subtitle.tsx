import React from "react";
import { slugify } from "../../utils/formatting";

export const Subtitle: React.FC<{ text: string }> = ({ text }) => {
	const subtitleId = slugify(text);
	return (
		<div className="Subtitle" id={subtitleId}>
			<h2>{text}</h2>
		</div>
	);
};
