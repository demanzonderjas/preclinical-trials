import React from "react";
import { ExpandableText } from "../components/layout/ExpandableText";
import { Page, PageWithSubmenu, PrimaryHeaderPageWithSubMenu } from "../components/layout/Page";
import { aboutUsSubMenu } from "../data/about-us/aboutUsData";

export const AdvisoryBoardPage: React.FC = () => {
	return (
		<PrimaryHeaderPageWithSubMenu title="Advisory board">
			<PageWithSubmenu subMenu={aboutUsSubMenu}>
				<ExpandableText
					header="Prof Jonathan Kimmelman (McGill University, Montreal, Canada; Biomedical ethics)"
					body="<p>Jonathan is a professor in biomedical ethics at the McGill University, Montreal, Canada. He is also the director of the biomedical unit of the faculty of medicine.</p>"
				/>
				<ExpandableText
					header="Prof. Paul Glasziou"
					body="<p>Paul is a professor in evidence-based medicine at the Bond University, Gold Coast, Australia.</p>"
				/>
				<ExpandableText
					header="Prof John Ioannidis (Stanford University, Standford, USA; Health research and policy)"
					body="<p>
					John is a professor of Medicine and Heath Research and Policy at the Standford University School of Medicine and a Professor of Statistics at Standford University School of Humanities and Science. He is also director of Standford Prevention Research Center, co-director of the Meta-Research Innovation Center at Standford (METRICS) and he is editor in chief of the European Journal of Clinical Investigation. </p>"
				/>
				<ExpandableText
					header="Prof. Annelien Bredenoord"
					body="<p>Annelien is a professor of Ethics of Biomedical Innovation at the University Medical Center of Utrecht, The Netherlands. As of 2015, she us a member of the Dutch Senate (Eerste Kamer) on behalf of D66.</p>"
				/>
				<ExpandableText
					header="Prof. Lina Badimon"
					body="<p>Lina is the director of the Cardiovascular Research Center (CSIC-ICCC) at the Autonomous University of Barcelona, Spain. She is also and co-founder &amp; chief scientific officer of the European Society of Cardiology (ESC).</p>"
				/>
				<ExpandableText
					header="Prof. Thomas Eschenhagen"
					body="<p>Thomas is a professor of Pharmacology at the University Medical Center Hamburg-Eppendorf, Germany. He is also Director of the department of Experimental Pharmacology and Toxicology. He is also one of the board of Directors of the DZHK, the German center for cardiovascular research.</p>"
				/>
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
						Chamuleau SAJ - Translational research in cardiovascular repair: A call for
						a paradigm shift
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
					The Dutch parliament passed a motion on July 3rd 2018 stating that prospective
					registration of animal studies and sharing of data should become the norm.
				</p>
				<p>
					Internationally, we are supported by the TACTICS consortium and the European
					Society of Cardiology working group on cardiovascular regenerative and
					reparative medicine (ESC WG CARE). We plan to expand this line of international
					support.
				</p>
				<h3>Support for prospective registration of confirmatory animal studies</h3>
				<p>
					In The Netherlands we are now supported by funders, research institutes and
					research groups. The Royal Netherlands Academy of Arts and Sciences and the
					Netherlands Organization for Scientific Research are involved to guarantee
					permanent access to the database. Internationally, we are supported by the
					TACTICS consortium and the European Society of Cardiology working group on
					cardiovascular regenerative and reparative medicine (ESC WG CARE). We plan to
					expand this line of international support.
				</p>
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
