import React, { useEffect, useState } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getProtocolCountsPerCountryQuery } from "../../queries/protocol";
import { TLeaderboardRow } from "../../typings/stats";
import { getCountries } from "../../utils/countries";

export const Leaderboard: React.FC<{ limit?: number; centered?: boolean }> = ({
	limit,
	centered = true
}) => {
	const [counts, setCounts] = useState<TLeaderboardRow[]>(null);
	const countries = getCountries();
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const countsPerCountry = await getProtocolCountsPerCountryQuery(limit);
			setCounts(
				Object.keys(countsPerCountry).map(countryCode => ({
					countryCode: countryCode.toLowerCase(),
					total: countsPerCountry[countryCode]
				}))
			);
		})();
	}, []);

	if (!counts) {
		return null;
	}

	return (
		<div
			className="Leaderboard layout-wrapper"
			style={{ marginLeft: centered ? "auto" : 0, marginRight: centered ? "auto" : 0 }}
		>
			<div className="header">
				<h2>{t("leaderboard")}</h2>
				<p>{t("leaderboard_description")}</p>
			</div>
			<div className="counts">
				{counts.map(row => (
					<div className="LeaderboardRow" key={row.countryCode}>
						<img
							src={`https://flagcdn.com/w80/${row.countryCode}.png`}
							srcSet={`https://flagcdn.com/w160/${row.countryCode}.png 2x`}
							width="80"
							alt={countries[row.countryCode.toUpperCase()]}
						/>
						<span>{countries[row.countryCode.toUpperCase()]}</span>
						<span>{row.total}</span>
					</div>
				))}
			</div>
		</div>
	);
};
