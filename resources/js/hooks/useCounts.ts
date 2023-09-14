import { useEffect, useState } from "react";
import { getTotalUserAccountsQuery } from "../queries/account";
import {
	getImportLogsQuery,
	getProtocolCountsPerMonthQuery,
	getProtocolCountsQuery,
	getProtocolCountsRejectedQuery
} from "../queries/protocol";
import { TStatsPerMonth } from "../typings/stats";
import { TImportLog } from "../typings/protocols";

export function useEmbargoCounts() {
	const [counts, setCounts] = useState<{ total: number; with_embargo: number }>(null);

	useEffect(() => {
		(async () => {
			const countsResponse = await getProtocolCountsQuery();
			setCounts(countsResponse);
		})();
	}, []);

	return counts;
}

export function useRejectedCounts() {
	const [counts, setCounts] = useState<{ total: number }>(null);

	useEffect(() => {
		(async () => {
			const countsResponse = await getProtocolCountsRejectedQuery();
			setCounts(countsResponse);
		})();
	}, []);

	return counts;
}

export function useCountsPerMonth() {
	const [counts, setCounts] = useState<TStatsPerMonth[]>([]);

	useEffect(() => {
		(async () => {
			const countsResponse = await getProtocolCountsPerMonthQuery();
			setCounts(
				Object.keys(countsResponse).map(yearMonth => ({
					year_month: yearMonth,
					total: countsResponse[yearMonth]
				}))
			);
		})();
	}, []);

	return counts;
}

export function useTotalUserAccounts() {
	const [counts, setCounts] = useState<{ total: number }>(null);

	useEffect(() => {
		(async () => {
			const countsResponse = await getTotalUserAccountsQuery();
			setCounts(countsResponse);
		})();
	}, []);

	return counts;
}

export function useImportLogs() {
	const [logs, setLogs] = useState<TImportLog[]>([]);

	useEffect(() => {
		(async () => {
			const response = await getImportLogsQuery();
			setLogs(response);
		})();
	}, []);

	return logs;
}
