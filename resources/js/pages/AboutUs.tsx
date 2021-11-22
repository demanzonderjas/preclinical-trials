import React from "react";
import { Page, PageWithSubmenu } from "../components/layout/Page";
import { aboutUsSubMenu } from "../data/about-us/aboutUsData";

export const AboutPCTPage: React.FC = () => {
	return (
		<Page title="About PCT">
			<PageWithSubmenu subMenu={aboutUsSubMenu}>
				<h3>Goals and aims of Preclinicaltrials.eu</h3>
				<p>
					Preclinicaltrials.eu aims to provide a comprehensive overview of all animal
					studies, including those that might otherwise remain unpublished. By
					(prospective) registration of animal studies we aim to:
				</p>
				<ul>
					<li>Increase transparency</li>
					<li>Avoid unnecessary duplication of animal studies</li>
					<li>
						Reduce reporting bias, such as publication bias and bias induced by
						selective outcome reporting, p-hacking and HARKing
					</li>
					<li>Increase data sharing, by</li>
					<ul>
						<li>
							allowing fellow researchers and reviewers to access information on the
							study design, which is often lacking in publications
						</li>
						<li>
							provide a platform to share details and data of otherwise unpublished
							animal studies
						</li>
					</ul>
					<li>Create opportunities for collaborative research</li>
				</ul>
				<h3>Which studies can you register on Preclinicaltrials.eu?</h3>
				<p>
					The register is open for all animal studies. We especially encourage researchers
					to register their confirmatory studies. This register is created with support of
					the Transnational AllianCe for regenerative Therapies In Cardiovascular
					Syndromes (TACTICS) alliance. Therefore the original focus is on the field of
					cardiac regenerative therapy. The design of the registration form is discussed
					with members of the TACTICS alliance. However, the register is open for studies
					from all fields of biomedical science. Furthermore, registration is not limited
					to a certain country or continent.
				</p>
			</PageWithSubmenu>
		</Page>
	);
};
