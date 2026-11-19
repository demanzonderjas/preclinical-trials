/** A public protocol as summarised by App\Services\PublicRegister. */
export type PublicProtocol = {
	id: number;
	pct_id: string;
	title: string;
	summary: string | null;
	study_status: string | null;
	study_status_label: string | null;
	study_stage: string | null;
	study_stage_label: string | null;
	species: string | null;
	species_label: string | null;
	research_field: string | null;
	centre_name: string | null;
	centre_city: string | null;
	country: string | null;
	country_name: string | null;
	/** Every study centre; centre_name, centre_city and country are the first one. */
	centres?: RegisterCentre[];
	start_date: string | null;
	end_date: string | null;
	period: string | null;
	registered_at: string | null;
	registered_on: string | null;
	registered_year: number | null;
	registered_before_start: boolean;
};

export type RegisterFigures = {
	total: number;
	public: number;
	under_embargo: number;
	first_year: number | null;
	registered_before_start: number;
	countries: number;
	top_countries: string[];
	per_year: { year: number; count: number }[];
	stages: { confirmatory: number; exploratory: number };
	species: { species: string; label: string; count: number }[];
};

export type RegisterCentre = { name: string | null; city: string | null; country: string | null; country_name: string | null };

/** Every study centre on one line: "UMC Utrecht · Utrecht, NL; Charité · Berlin, DE". */
export function centreLine(protocol: Pick<PublicProtocol, "centre_name" | "centre_city" | "country" | "centres">) {
	const centres = protocol.centres ?? [{ name: protocol.centre_name, city: protocol.centre_city, country: protocol.country, country_name: null }];
	const line = (centre: Pick<RegisterCentre, "name" | "city" | "country">) => [centre.name, [centre.city, centre.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
	return centres.map(line).filter(Boolean).join("; ") || null;
}
