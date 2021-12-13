import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video } from "../components/base/Video";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Highlight } from "../components/layout/Highlight";
import { Page, PrimaryHeaderPage } from "../components/layout/Page";
import { PartnerBlock } from "../components/layout/PartnerBlock";
import { usePage } from "../hooks/usePage";
import { getProtocolCountsQuery } from "../queries/protocol";

export const HomePage: React.FC = () => {
	const [counts, setCounts] = useState<{ total: number; with_embargo: number }>(null);
	const { page } = usePage();

	useEffect(() => {
		(async () => {
			const countsResponse = await getProtocolCountsQuery();
			setCounts(countsResponse);
		})();
	}, []);

	if (!page) {
		return null;
	}

	return (
		<PrimaryHeaderPage title={page.title} subtitle={page.subtitle}>
			<div className="Home">
				{!!counts && (
					<Highlight
						image="note.png"
						text={`${counts.total} protocols registered already! (${counts.with_embargo} under embargo)`}
					/>
				)}
				<ContentBlock maxWidth="80%">
					<div className="two-columns">
						<div dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }} />
						<div>
							<Video url="xYjLvDBTsV4" />
						</div>
					</div>
					<div dangerouslySetInnerHTML={{ __html: page.content_blocks[1].content }} />
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
