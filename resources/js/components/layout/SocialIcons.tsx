import React from "react";
import { Image } from "../base/Image";

export const SocialIcons: React.FC = () => {
	return (
		<div className="SocialIcons">
			<div
				style={{
					display: "inline-block",
					marginRight: "5px",
					cursor: "pointer"
				}}
				onClick={() =>
					window.open(
						"https://twitter.com/preclinicaltra1",
						"_blank",
						"noreferrer noopener"
					)
				}
			>
				<Image filename="twitter.png" />
			</div>
			<div
				style={{ display: "inline-block", cursor: "pointer" }}
				onClick={() =>
					window.open(
						"https://www.linkedin.com/company/preclinicaltrialseu",
						"_blank",
						"noreferrer noopener"
					)
				}
			>
				<Image filename="linkedin.png" />
			</div>
		</div>
	);
};
