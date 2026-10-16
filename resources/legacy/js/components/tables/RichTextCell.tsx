import React from "react";
import xss from "xss";

export const RichTextCell: React.FC<{ value: string }> = ({ value }) => {
	return (
		<td className="RichTextCell CommentsCell">
			<div className="comment">
				<p className="message" dangerouslySetInnerHTML={{ __html: xss(value) }} />
			</div>
		</td>
	);
};
