import React from "react";
import { TAboutUs } from "../../typings/aboutUs";
import { Image } from "../base/Image";
import { Subtitle } from "./Subtitle";

export const AboutUsBlock: React.FC<{ title: string; personList: TAboutUs[] }> = ({
	title,
	personList
}) => {
	return (
		<div className="AboutUsBlock">
			<h2>{title}</h2>
			<div className="persons">
				{personList.map(person => (
					<AboutUsPerson key={person.name} {...person} />
				))}
			</div>
		</div>
	);
};

export const AboutUsPerson: React.FC<TAboutUs> = ({ image, name, title }) => {
	return (
		<div className="AboutUsPerson">
			<div className="header">
				<div className="header-bg"></div>
				<Image filename={`about-us/${image}`} />
			</div>
			<div className="name">
				<span>{name}</span>
			</div>
			<div className="title">
				<span>{title}</span>
			</div>
		</div>
	);
};
