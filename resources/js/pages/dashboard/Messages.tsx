import React, { useEffect, useState } from "react";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { messagesTable } from "../../data/tables/messages";
import { getMyChannelsQuery } from "../../queries/messages";
import { FilterStore } from "../../stores/FilterStore";

export const MessagesPage: React.FC = () => {
	const [filterStore] = useState(new FilterStore());
	const [channels, setChannels] = useState([]);

	useEffect(() => {
		(async () => {
			const response = await getMyChannelsQuery();
			setChannels(response.channels);
		})();
	}, []);

	return (
		<FilterStoreProvider store={filterStore}>
			<Page title="Messages">
				<div className="Messages">
					<ContentBlock maxWidth="80%">
						<p>
							Listed below are all conversations that you are currently involved with.
						</p>
						<TableBlock table={messagesTable} rows={channels} />
					</ContentBlock>
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
