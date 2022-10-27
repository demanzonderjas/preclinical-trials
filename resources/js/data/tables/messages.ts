import { TTable, TTableCellName } from "../../typings/tables";
import { contactCell, latestMessageCell, messageActionCell } from "./cells/messages";
import { lastUpdatedAtCell, titleCell } from "./cells/protocol";

export const messagesTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.Contact,
		TTableCellName.LastUpdated,
		TTableCellName.LatestMessage,
		TTableCellName.Action
	],
	cells: [titleCell, contactCell, lastUpdatedAtCell, latestMessageCell, messageActionCell]
};
