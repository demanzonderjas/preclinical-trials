import React from "react";
import { TNewsItem } from "../../typings/news";
import day from "dayjs";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { Image } from "../base/Image";

export const NewsItemCard: React.FC<TNewsItem> = ({ title, summary, updated_at }) => {
	const { t } = useTranslationStore();
	return (
		<div className="card-wrapper">
			<div className="NewsItemCard card">
				<div className="figure"></div>
				<div className="header">
					<p>{title}</p>
				</div>
				<div className="body">
					<p>{summary}</p>
					<div className="date">
						<span>{day(updated_at).format("D MMM YYYY")}</span>
					</div>
					<div className="read-more">
						<span>{t("read_more")}</span>
						<div className="arrow">
							<Image filename="arrow-right-white.png" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
