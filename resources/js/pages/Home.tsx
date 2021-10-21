import React from "react";
import { useHistory } from "react-router-dom";
import { LoginForm } from "../components/account/LoginForm";
import { Video } from "../components/base/Video";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Highlight } from "../components/layout/Highlight";
import { Page } from "../components/layout/Page";
import { PageHeader } from "../components/layout/PageHeader";
import { PartnerBlock } from "../components/layout/PartnerBlock";
import { useTranslationStore } from "../hooks/useTranslationStore";

export const HomePage: React.FC = () => {
	const { t } = useTranslationStore();
	const history = useHistory();

	return (
		<Page
			title="PreclinicalTrials.eu"
			subtitle="International register of preclinical trial protocols"
			hasCurvedHeader={true}
		>
			<div className="Home">
				<Highlight
					image="note.png"
					text="98 protocols registered already! (25 under embargo)"
				/>
				<Video url="xYjLvDBTsV4" />
				<LoginForm />
				<ContentBlock>
					<p>
						Preclinicaltrials aims to provide a comprehensive listing of preclinical
						animal study protocols. Preferably registered at inception in order to
						increase transparency, help avoid duplication, and reduce the risk of
						reporting bias by enabling comparison of the completed study with what was
						planned in the protocol. Registration of your study requires you to create
						an account that is:
					</p>
					<ul>
						<li>Anonymous</li>
						<li>Free of charge</li>
						<li>Has an optional embargo period</li>
					</ul>
					<p>
						This register is web-based, open to all types of animal studies and freely
						accessible and searchable to all with a preclinicaltrials.eu account. The
						registration form is designed by experts on preclinical animal studies and
						preclinical evidence synthesis. Please join us and create a user account,
						this will provide access to the database and enables you to register your
						preclinical trial. Contact us at{" "}
						<a href="mailto:info@preclinicaltrials.eu">info@preclinicaltrials.eu</a>
					</p>
				</ContentBlock>
				<PartnerBlock />
			</div>
		</Page>
	);
};
