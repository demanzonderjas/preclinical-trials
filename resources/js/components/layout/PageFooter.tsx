import React from "react";
import { Image } from "../base/Image";

export const PageFooter: React.FC = () => {
	return (
		<div className="PageFooter">
			<div className="links">
				<ul>
					<li>Disclaimer</li>
					<li>Contact</li>
					<li>
						<Image filename="twitter.png" />
					</li>
				</ul>
			</div>
		</div>
	);
};
