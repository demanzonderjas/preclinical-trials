import { TTable, TTableCellName } from "../../typings/tables";
import { newsAdminActionCell } from "./cells/news";
import { lastUpdatedAtCell, publishStatusCell, titleCell } from "./cells/protocol";

export const adminNewsTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.PublishStatus,
		TTableCellName.AdminAction
	],
	cells: [titleCell, lastUpdatedAtCell, publishStatusCell, newsAdminActionCell]
};
