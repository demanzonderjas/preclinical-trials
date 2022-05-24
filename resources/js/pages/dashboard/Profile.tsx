import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Image } from "../../components/base/Image";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";

export const ProfilePage: React.FC = observer(() => {
	const { t } = useTranslationStore();
	const { user } = useUser();
	const { push } = useHistory();

	if (!user) {
		return null;
	}

	return (
		<Page title="My profile">
			<div className="ProfilePage">
				<ContentBlock maxWidth="80%" withBorder={true}>
					<p>
						Here you can find all of the information kept in your profile. You can
						change any of the information whenever you want to.
					</p>
					<div className="card-wrapper single">
						<div className="card">
							<div className="header">
								<p>
									{user.first_name} {user.last_name}
								</p>
							</div>
							<div className="body">
								<div className="detail">
									<label>{t("institution")}</label>
									<p>{user.institution}</p>
								</div>
								<div className="detail">
									<label>{t("contact_email")}</label>
									<p>{user.email}</p>
								</div>
								<div className="detail">
									<label>{t("password")}</label>
									<p>**************</p>
								</div>
								<div
									className="read-more"
									onClick={() => push("/dashboard/edit-profile")}
								>
									<span>{t("edit_profile")}</span>
									<div className="arrow">
										<Image filename="arrow-right-white.png" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</ContentBlock>
			</div>
		</Page>
	);
});
