import React from "react";
import { partnerData, sponsorsData } from "../../data/partners/partnerData";
import { TPartner } from "../../typings/partners";
import { Image } from "../base/Image";
import { Subtitle } from "./Subtitle";

export const SponsorsBlock: React.FC = () => {
	return (
		<div className="SponsorsBlock">
			<Subtitle text="They Fund Us" />
			<p>
				They fund us to improve research transparency & reproducibility and to reduce
				unnecessary animal use.
			</p>
			<div className="sponsors">
				{sponsorsData.map(partner => (
					<Sponsor key={partner.image} {...partner} />
				))}
			</div>
		</div>
	);
};

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

export const Sponsor: React.FC<TPartner> = ({ image, url }) => {
	return (
		<div className="Sponsor">
			<a href={url} rel="noopener noreferrer" target="_blank">
				<Image filename={`partners/${image}`} />
			</a>
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
