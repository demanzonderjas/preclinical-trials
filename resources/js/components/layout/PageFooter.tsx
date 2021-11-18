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
						<div
							style={{
								display: "inline-block",
								marginRight: "5px",
								cursor: "pointer"
							}}
							onClick={() =>
								window.open(
									"https://www.linkedin.com/company/preclinicaltrialseu",
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
									"https://twitter.com/preclinicaltra1",
									"_blank",
									"noreferrer noopener"
								)
							}
						>
							<Image filename="linkedin.png" />
						</div>
					</li>
				</ul>
			</div>
		</div>
	);
};
