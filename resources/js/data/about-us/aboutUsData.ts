import { TAboutUs, TAboutUsType } from "../../typings/aboutUs";
import { TSubMenu } from "../../typings/layout";

export const aboutUsSubMenu: TSubMenu = {
	items: [
		{
			text: "Goals",
			target: "/about-pct"
		},
		{
			text: "Team",
			target: "/about-pct/team"
		},
		{
			text: "Advisory board",
			target: "/about-pct/advisory-board"
		},
		{
			text: "Ambassadors",
			target: "/about-pct/ambassadors"
		},
		{
			text: "Background information",
			target: "/about-pct/background-information"
		}
	]
};

export const aboutUsData: TAboutUs[] = [
	{
		name: "Julia Menon, Msc",
		title: "Scientific Daily Director",
		image: "julia_menon.jpg",
		role: TAboutUsType.DailyDirector
	},
	{
		name: "Annemarie Scholman-Végh, Msc",
		title: "Project Manager",
		image: "annemarie_scholman_vegh.png",
		role: TAboutUsType.DailyDirector
	},

	{
		name: "Prof. Dr. Steven Chamuleau",
		image: "steve_chamuleau.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation: "Amsterdam University Medical Center"
	},
	{
		name: "Prof. Dr. Dirk Duncker",
		image: "dirk_duncker.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation: "Erasmus University Medical Center"
	},
	{
		name: "Mira van der Naald, MD",
		image: "mira_van_der_naald.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation:
			"University Medical Center Utrecht, the Netherlands - Member of the Transnational AllianCe for regenerative Therapies In Cardiovascular Syndromes (TACTICS)"
	},
	{
		name: "Dr. Judith de Haan",
		image: "dr_judith_de_haan.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation: "Open Science Programme (Utrecht University)"
	},
	{
		name: "Wim de Leeuw",
		image: "wim_de_leeuw.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation: "Animal Welfare Body Utrecht"
	},
	{
		name: "Dr. Kim Wever",
		image: "kimberley_wever.png",
		role: TAboutUsType.SteeringCommittee,
		workLocation:
			"Systematic Review Center for Laboratory animal Experimentation (SYRCLE), Department of Health Evidence, Radboud university medical center, Nijmegen, The Netherlands"
	}
];
