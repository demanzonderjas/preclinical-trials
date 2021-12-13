import { useEffect, useState } from "react";
import { getPageBySlugQuery } from "../queries/pages";
import { TContentBlockType, TPage } from "../typings/pages";

export function usePage(): { page: TPage } {
	const [pageData, setPageData] = useState<TPage>({
		title: "",
		subtitle: "",
		content_blocks: [
			{
				type: TContentBlockType.Text,
				content: ""
			},
			{
				type: TContentBlockType.Text,
				content: ""
			}
		]
	});

	useEffect(() => {
		(async () => {
			const pageData = await getPageBySlugQuery(location.pathname);
			setPageData(pageData.page);
		})();
	}, []);

	return {
		page: pageData
	};
}
