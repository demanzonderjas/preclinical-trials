import React from "react";
import { Link } from "react-router-dom";

export const Menu: React.FC = () => {
	return (
		<ul className="Menu">
			<MenuItem text="Database" url={"/database"} />
			<MenuItem text="About PCT" url="/about-pct" />
			<MenuItem text="Help" url="/faq" />
			<MenuItem text="News" url="/news" />
			<MenuItem text="Contact" url="/contact" />
		</ul>
	);
};

export const MenuItem: React.FC<{ text: string; url: string }> = ({ text, url }) => {
	return (
		<li className="MenuItem">
			<Link to={url}>{text}</Link>
		</li>
	);
};
