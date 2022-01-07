import React from "react";
import { ExpandableText } from "../components/layout/ExpandableText";
import { Page, PageWithSubmenu, PrimaryHeaderPageWithSubMenu } from "../components/layout/Page";
import { aboutUsSubMenu } from "../data/about-us/aboutUsData";
import { usePage } from "../hooks/usePage";

export const AdvisoryBoardPage: React.FC = () => {
	const { page } = usePage();
	return (
		<PrimaryHeaderPageWithSubMenu title={page.title}>
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
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
