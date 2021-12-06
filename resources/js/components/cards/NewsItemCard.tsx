import React from "react";
import { TNewsItem } from "../../typings/news";
import day from "dayjs";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { Image } from "../base/Image";
import { useHistory } from "react-router";
import cx from "classnames";

export const NewsItemCard: React.FC<TNewsItem & { single?: boolean }> = ({
	title,
	content,
	summary,
	updated_at,
	id,
	single
}) => {
	const { t } = useTranslationStore();
	const { push } = useHistory();
	return (
		<div className={cx("card-wrapper", { single: !!single })}>
			<div
				className="NewsItemCard card"
				onClick={single ? undefined : () => push(`/news/view-item/${id}`)}
			>
				<div className="figure"></div>
				<div className="header">
					<p>{title}</p>
				</div>
				<div className="body">
					{single && <p>{summary}</p>}
					{summary && (
						<div className="content" dangerouslySetInnerHTML={{ __html: content }} />
					)}
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
