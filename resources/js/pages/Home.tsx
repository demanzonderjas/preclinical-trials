import React from "react";
import { useHistory } from "react-router-dom";
import { LoginForm } from "../components/account/LoginForm";
import { Video } from "../components/base/Video";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { PageHeader } from "../components/layout/PageHeader";
import { useTranslationStore } from "../hooks/useTranslationStore";

export const HomePage: React.FC = () => {
	const { t } = useTranslationStore();
	const history = useHistory();

	return (
		<Page
			title="PreclinicalTrials.eu"
			subtitle="International register of preclinical trial protocols"
		>
			<div className="Home">
				<Video url="xYjLvDBTsV4" />
				<LoginForm />
				<ContentBlock />
			</div>
		</Page>
	);
};
