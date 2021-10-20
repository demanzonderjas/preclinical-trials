import React from "react";
import { partnerData } from "../../data/partners/partnerData";
import { TPartner } from "../../typings/partners";
import { Image } from "../base/Image";
import { Subtitle } from "./Subtitle";

export const PartnerBlock: React.FC = () => {
	return (
		<div className="PartnerBlock">
			<Subtitle text="Partners" />
			<div className="partners">
				{partnerData.map(partner => (
					<Partner key={partner.image} {...partner} />
				))}
			</div>
		</div>
	);
};

export const Partner: React.FC<TPartner> = ({ image, url }) => {
	return (
		<div className="Partner">
			<a href={url} rel="noopener noreferrer" target="_blank">
				<Image filename={`partners/${image}`} />
			</a>
		</div>
	);
};
