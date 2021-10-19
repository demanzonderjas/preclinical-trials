import React from "react";

export const Video: React.FC<{ url: string }> = ({ url }) => {
	return (
		<div className="VideoWrapper">
			<iframe
				width="100%"
				height="100%"
				src={`https://www.youtube-nocookie.com/embed/${url}`}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		</div>
	);
};
