import React from "react";
import { AboutUsBlock } from "../components/layout/AboutUsBlock";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { PartnerBlock } from "../components/layout/PartnerBlock";
import { SubMenu } from "../components/layout/SubMenu";
import { aboutUsData, aboutUsSubMenu } from "../data/about-us/aboutUsData";
import { TAboutUsType } from "../typings/aboutUs";

export const AboutUsPage: React.FC = () => {
	return (
		<Page title="About Us">
			<SubMenu items={aboutUsSubMenu} />
			<div className="AboutUsPage">
				<ContentBlock>
					<h3 id="goals">Goals and aims of Preclinicaltrials.eu</h3>
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
								allowing fellow researchers and reviewers to access information on
								the study design, which is often lacking in publications
							</li>
							<li>
								provide a platform to share details and data of otherwise
								unpublished animal studies
							</li>
						</ul>
						<li>Create opportunities for collaborative research</li>
					</ul>
					<h3>Which studies can you register on Preclinicaltrials.eu?</h3>
					<p>
						The register is open for all animal studies. We especially encourage
						researchers to register their confirmatory studies. This register is created
						with support of the Transnational AllianCe for regenerative Therapies In
						Cardiovascular Syndromes (TACTICS) alliance. Therefore the original focus is
						on the field of cardiac regenerative therapy. The design of the registration
						form is discussed with members of the TACTICS alliance. However, the
						register is open for studies from all fields of biomedical science.
						Furthermore, registration is not limited to a certain country or continent.
					</p>
				</ContentBlock>
				<AboutUsBlock
					title="Daily Directors"
					personList={aboutUsData.filter(p => p.role === TAboutUsType.DailyDirector)}
				/>
				<AboutUsBlock
					title="Steering Committee"
					personList={aboutUsData.filter(p => p.role === TAboutUsType.SteeringCommittee)}
				/>
				<ContentBlock>
					<h3 id="advisory_board">Advisory board of preclinicaltrials.eu</h3>
					<strong>
						Prof Jonathan Kimmelman (McGill University, Montreal, Canada; Biomedical
						ethics)
					</strong>
					<p>
						Jonathan is a professor in biomedical ethics at the McGill University,
						Montreal, Canada. He is also the director of the biomedical unit of the
						faculty of medicine.
					</p>
					<strong>Prof. Paul Glasziou</strong>
					<p>
						Paul is a professor in evidence-based medicine at the Bond University, Gold
						Coast, Australia.
					</p>
					<strong>
						Prof John Ioannidis (Stanford University, Standford, USA; Health research
						and policy)
					</strong>
					<p>
						John is a professor of Medicine and Heath Research and Policy at the
						Standford University School of Medicine and a Professor of Statistics at
						Standford University School of Humanities and Science. He is also director
						of Standford Prevention Research Center, co-director of the Meta-Research
						Innovation Center at Standford (METRICS) and he is editor in chief of the
						European Journal of Clinical Investigation.
					</p>
					<strong>Prof. Annelien Bredenoord</strong>
					<p>
						Annelien is a professor of Ethics of Biomedical Innovation at the University
						Medical Center of Utrecht, The Netherlands. As of 2015, she us a member of
						the Dutch Senate (Eerste Kamer) on behalf of D66.
					</p>
					<strong>Prof. Lina Badimon</strong>
					<p>
						Lina is the director of the Cardiovascular Research Center (CSIC-ICCC) at
						the Autonomous University of Barcelona, Spain. She is also and co-founder &
						chief scientific officer of the European Society of Cardiology (ESC).
					</p>
					<strong>Prof. Thomas Eschenhagen</strong>
					<p>
						Thomas is a professor of Pharmacology at the University Medical Center
						Hamburg-Eppendorf, Germany. He is also Director of the department of
						Experimental Pharmacology and Toxicology. He is also one of the board of
						Directors of the DZHK, the German center for cardiovascular research.
					</p>
					<h3>Relevant literature</h3>
					<ul>
						<li>
							Kimmelman et al – Should preclinical studies be registered?
							DOI:10.1038/nbt.2261
						</li>
						<li>
							Jansen of Lorkeers SJ – All preclinical trials should be registered in
							advance in an online registry
						</li>
						<li>
							Chamuleau SAJ - Translational research in cardiovascular repair: A call
							for a paradigm shift
						</li>
					</ul>
					<strong>Preclinical systematic reviews and meta-analysis</strong>
					<p>
						The CAMARADES framework provides support for groups involved in preclinical
						systematic reviews and meta-analysis.
					</p>
					<p>
						The Systematic Review Center for Laboratory animal Experimentation (SYRCLE)
						supports and trains researchers working with preclinical systematic reviews.
					</p>
					<h3>Registries for clinical trials</h3>
					<p>
						There are multiple registrations for clinical trials. The World Health
						Organisation provides additional information on these clinical trials.
					</p>
					<p>
						The Dutch parliament passed a motion on July 3rd 2018 stating that
						prospective registration of animal studies and sharing of data should become
						the norm.
					</p>
					<p>
						Internationally, we are supported by the TACTICS consortium and the European
						Society of Cardiology working group on cardiovascular regenerative and
						reparative medicine (ESC WG CARE). We plan to expand this line of
						international support.
					</p>
					<h3>Support for prospective registration of confirmatory animal studies</h3>
					<p>
						In The Netherlands we are now supported by funders, research institutes and
						research groups. The Royal Netherlands Academy of Arts and Sciences and the
						Netherlands Organization for Scientific Research are involved to guarantee
						permanent access to the database. Internationally, we are supported by the
						TACTICS consortium and the European Society of Cardiology working group on
						cardiovascular regenerative and reparative medicine (ESC WG CARE). We plan
						to expand this line of international support.
					</p>
				</ContentBlock>
				<PartnerBlock />
			</div>
		</Page>
	);
};
