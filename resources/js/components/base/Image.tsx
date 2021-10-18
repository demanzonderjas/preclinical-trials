import React from "react";

export const Image: React.FC<{ filename: string }> = ({ filename }) => {
	return (
		<div className="ImageWrapper">
			<img src={`/images/${filename}`} />
		</div>
	);
};
