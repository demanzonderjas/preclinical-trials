import React, { useState } from "react";
import { Page } from "../components/layout/Page";
import { useTranslationStore } from "../hooks/useTranslationStore";
import { verifyEmail as verifyEmailQuery } from "../queries/user";
import { ContentBlock } from "../components/layout/ContentBlock";

export const VerifyEmailPage: React.FC = () => {
	const { t } = useTranslationStore();
	const [isVerifying, setIsVerifying] = useState(false);

	const verify = async () => {
		setIsVerifying(true);
		const response = await verifyEmailQuery();
		console.log(response);
	};

	return (
		<Page title="Verify Email">
			<ContentBlock withBorder>
				<div style={{ textAlign: "center" }}>
					<p className="intro">Verify your email by hitting the button below.</p>
					<button
						disabled={isVerifying}
						type="button"
						className="secondary small"
						onClick={verify}
					>
						{t("resend_email_verification")}
					</button>
				</div>
			</ContentBlock>
		</Page>
	);
};
