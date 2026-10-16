import React from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { Leaderboard } from "../../components/protocols/Leaderboard";
import {
	useCountsPerMonth,
	useEmbargoCounts,
	useImportLogs,
	useRegionSpecificStats,
	useRejectedCounts,
	useTotalUserAccounts
} from "../../hooks/useCounts";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TImportLogType } from "../../typings/protocols";

export const StatsPage: React.FC = () => {
	const embargoCounts = useEmbargoCounts();
	const rejectedCounts = useRejectedCounts();
	const countsPerMonth = useCountsPerMonth();
	const countsPerRegion = useRegionSpecificStats();
	const totalUsers = useTotalUserAccounts();
	const logs = useImportLogs();
	const { t } = useTranslationStore();

	return (
		<AdminPage title="Stats">
			<div className="flex-wrapper">
				<div className="Stats">
					<div className="stat">
						<label>{t("total_users")}</label>
						<span>{totalUsers?.total}</span>
					</div>
					<div className="stat">
						<label>{t("total_protocols")}</label>
						<span>{embargoCounts?.total}</span>
					</div>
					<div className="stat">
						<label>{t("total_under_embargo")}</label>
						<span>{embargoCounts?.with_embargo}</span>
					</div>
					<div className="stat">
						<label>{t("imported_via_pris")}</label>
						<span>{logs.filter(l => l.type === TImportLogType.PRIS).length}</span>
					</div>
					<div className="stat">
						<label>{t("imported_via_fc3r")}</label>
						<span>{logs.filter(l => l.type === TImportLogType.FC3R).length}</span>
					</div>
					<div className="stat">
						<label>{t("imported_via_iles")}</label>
						<span>{logs.filter(l => l.type === TImportLogType.ILES).length}</span>
					</div>
					<div className="stat">
						<label>{t("total_rejected")}</label>
						<span>{rejectedCounts?.total}</span>
					</div>
				</div>
				<div className="stat">
					<h3>{t("specific_protocol_numbers")}</h3>
				</div>
				<div className="Stats">
					<div className="stat">
						<label>{t("dutch_users")}</label>
						<span>{countsPerRegion?.dutch}</span>
					</div>
					<div className="stat">
						<label>{t("utrecht_users")}</label>
						<span>{countsPerRegion?.utrecht}</span>
					</div>
					<div className="stat">
						<label>{t("nijmegen_users")}</label>
						<span>{countsPerRegion?.nijmegen}</span>
					</div>
					<div className="stat">
						<label>{t("nijmegen_utrecht_protocols")}</label>
						<span>{countsPerRegion?.protocols}</span>
					</div>
				</div>
				<div className="Stats margin-20" style={{ display: "flex", gap: "30px" }}>
					<div className="counts-per-month">
						<div className="stat">
							<label>{t("total_per_month")}</label>
						</div>
						{countsPerMonth.map(count => (
							<div className="stat" key={count.year_month}>
								<label>{count.year_month.split("_").join("-")}</label>
								<span>{count.total}</span>
							</div>
						))}
					</div>
					<div style={{ width: "100%", display: "flex" }}>
						<Leaderboard centered={false} />
					</div>
				</div>
			</div>
		</AdminPage>
	);
};
