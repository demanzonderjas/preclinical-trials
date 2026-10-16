import React, { useEffect, useState } from "react";
import { Page } from "../components/layout/Page";
import { useTranslationStore } from "../hooks/useTranslationStore";
import { verifyEmail as verifyEmailQuery } from "../queries/user";
import { ContentBlock } from "../components/layout/ContentBlock";
import { useUser } from "../hooks/useUser";

export const VerifyEmailPage: React.FC = () => {
	const { t } = useTranslationStore();
	const [isVerifying, setIsVerifying] = useState(false);
	const [emailHasBeenSent, setEmailHasBeenSent] = useState(false);
	const { user } = useUser();

	const verify = async () => {
		setIsVerifying(true);
		await verifyEmailQuery();
		setEmailHasBeenSent(true);
	};

	useEffect(() => {
		if (user && user.is_verified) {
			location.href = "/dashboard";
		}
	}, [user]);

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
					{!!emailHasBeenSent && (
						<p>
							The email has been sent to your email address:{" "}
							<strong>{user.email}</strong>
						</p>
					)}
				</div>
			</ContentBlock>
		</Page>
	);
};
