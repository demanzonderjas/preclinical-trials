import React from "react";

export const Image: React.FC<{ filename: string; handleClick?: Function }> = ({
	filename,
	handleClick
}) => {
	return (
		<div className="ImageWrapper" onClick={handleClick ? () => handleClick() : undefined}>
			<img src={`/images/${filename}`} />
		</div>
	);
};
