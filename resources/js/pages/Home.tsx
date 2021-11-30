import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video } from "../components/base/Video";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Highlight } from "../components/layout/Highlight";
import { Page, PrimaryHeaderPage } from "../components/layout/Page";
import { PartnerBlock } from "../components/layout/PartnerBlock";
import { getProtocolCountsQuery } from "../queries/protocol";

export const HomePage: React.FC = () => {
	const [counts, setCounts] = useState<{ total: number; with_embargo: number }>(null);

	useEffect(() => {
		(async () => {
			const countsResponse = await getProtocolCountsQuery();
			setCounts(countsResponse);
		})();
	}, []);

	return (
		<PrimaryHeaderPage
			title="PreclinicalTrials.eu"
			subtitle="International register of preclinical trial protocols"
		>
			<div className="Home">
				{!!counts && (
					<Highlight
						image="note.png"
						text={`${counts.total} protocols registered already! (${counts.with_embargo} under embargo)`}
					/>
				)}
				<ContentBlock maxWidth="80%">
					<div className="two-columns">
						<div>
							<p>
								Preclinicaltrials aims to provide a comprehensive listing of
								preclinical animal study protocols. Preferably registered at
								inception in order to increase transparency, help avoid duplication,
								and reduce the risk of reporting bias by enabling comparison of the
								completed study with what was planned in the protocol. Registration
								of your study requires you to create an account that is:
							</p>
							<ul>
								<li>Anonymous</li>
								<li>Free of charge</li>
								<li>Has an optional embargo period</li>
							</ul>
						</div>
						<div>
							<Video url="xYjLvDBTsV4" />
						</div>
					</div>
					<p>
						This register is web-based, open to all types of animal studies and freely
						accessible and searchable to all with a preclinicaltrials.eu account. The
						registration form is designed by experts on preclinical animal studies and
						preclinical evidence synthesis. Please join us and create a user account,
						this will provide access to the database and enables you to register your
						preclinical trial. Contact us at{" "}
						<a href="mailto:info@preclinicaltrials.eu">info@preclinicaltrials.eu</a>
					</p>
					<div className="button-wrapper" style={{ margin: "40px 0" }}>
						<Link to="/database">
							<button className="tertiary big">Search database</button>
						</Link>
					</div>
				</ContentBlock>
				<PartnerBlock />
			</div>
		</PrimaryHeaderPage>
	);
};
