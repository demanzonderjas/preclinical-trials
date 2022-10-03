import React from "react";

export const RichTextCell: React.FC<{ value: string }> = ({ value }) => {
	return (
		<td className="RichTextCell CommentsCell">
			<div className="comment">
				<p className="message" dangerouslySetInnerHTML={{ __html: value }} />
			</div>
		</td>
	);
};
