import React from "react";
import { Link } from "react-router-dom";
import { useIsLoggedIn } from "../../hooks/useLogin";

export const Menu: React.FC = () => {
	const isLoggedIn = useIsLoggedIn();
	return (
		<ul className="Menu">
			<MenuItem
				text={isLoggedIn ? "Dashboard" : "Database"}
				url={isLoggedIn ? "dashboard" : "database"}
			/>
			<MenuItem text="FAQ" url="faq" />
			<MenuItem text="About Us" url="about-us" />
			<MenuItem text="News" url="news" />
			<MenuItem text="Contact" url="contact" />
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
