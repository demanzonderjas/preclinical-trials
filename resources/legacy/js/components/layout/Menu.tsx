import React from "react";
import { Link, NavLink } from "react-router-dom";

export const Menu: React.FC = () => {
	return (
		<ul className="Menu layout-wrapper">
			<MenuItem text="Database" url={"/database"} />
			<MenuItem text="About PCT" url="/about-pct" />
			<MenuItem text="Help" url="/help" />
			<MenuItem text="News" url="/news" />
			<MenuItem text="Contact" url="/contact" />
		</ul>
	);
};

export const MenuItem: React.FC<{ text: string; url: string }> = ({ text, url }) => {
	return (
		<li className="MenuItem">
			<NavLink to={url}>{text}</NavLink>
		</li>
	);
};
