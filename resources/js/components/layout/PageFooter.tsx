import React from "react";
import { Image } from "../base/Image";
import { Link } from "react-router-dom";

export const PageFooter: React.FC = () => {
	return (
		<div className="PageFooter">
			<div className="links">
				<ul>
					<li>
						<Link to="/disclaimer">Disclaimer</Link>
					</li>
					<li>
						<Link to="/contact">Contact</Link>
					</li>
					<li>
						<Image filename="twitter.png" />
					</li>
				</ul>
			</div>
		</div>
	);
};
