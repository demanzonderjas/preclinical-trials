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
			<Subtitle text={title} />
			<div className="persons">
				{personList.map(person => (
					<AboutUsPerson key={person.name} {...person} />
				))}
			</div>
		</div>
	);
};

export const AboutUsPerson: React.FC<TAboutUs> = ({ image, name }) => {
	return (
		<div className="AboutUsPerson">
			<Image filename={`about-us/${image}`} />
			<div className="label">
				<span>{name}</span>
			</div>
		</div>
	);
};
