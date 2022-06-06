import { TTable, TTableCellName } from "../../typings/tables";
import { faqAdminActionCell } from "./cells/faq";
import { lastUpdatedAtCell, publishStatusCell, titleCell } from "./cells/protocol";

export const adminFaqItemsTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.PublishStatus,
		TTableCellName.AdminAction
	],
	cells: [titleCell, lastUpdatedAtCell, publishStatusCell, faqAdminActionCell]
};
