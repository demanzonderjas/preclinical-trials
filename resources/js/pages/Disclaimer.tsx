import React from "react";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";

export const DisclaimerPage: React.FC = () => {
	return (
		<Page title="Disclaimer" subtitle="Terms and conditions">
			<ContentBlock>
				<div className="DisclaimerPage">
					<p>
						The information contained in this website is for general information
						purposes only and the safety and validity of a study on preclinicaltrials.eu
						is the responsibility of the study sponsor and investigator. The information
						is provided by preclinicaltrials.eu and while we endeavour to keep the
						information up to date and correct, we make no representations or warranties
						of any kind, express or implied, about the completeness, accuracy,
						reliability, suitability or availability with respect to the website or the
						information, products, services, or related graphics contained on the
						website for any purpose. Any reliance you place on such information is
						therefore strictly at your own risk.
					</p>
					<p>
						In no event will preclinicaltrials.eu or its developers be liable for any
						loss or damage including without limitation, indirect or consequential loss
						or damage, or any loss or damage whatsoever arising from loss of data or
						profits arising out of, or in connection with, the use of this website.
						Through this website you are able to link to other websites which are not
						under the control of preclinicaltrials.eu. While we make efforts to ensure
						the links are correct and up to date, we have no control over the nature,
						content and availability of those sites. The inclusion of any links does not
						necessarily imply a recommendation or endorse the views expressed within
						them and you use those links at your own risk.
					</p>
					<p>
						Every effort is made to keep the website up and running smoothly. However,
						preclinicaltrials.eu takes no responsibility for, and will not be liable
						for, the website being unavailable due to technical issues.
					</p>
				</div>
			</ContentBlock>
		</Page>
	);
};
