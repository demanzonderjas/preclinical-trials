import { TTable, TTableCellName } from "../../typings/tables";
import { faqAdminActionCell } from "./cells/faq";
import { lastUpdatedAtCell, nameCell } from "./cells/protocol";

export const ambassadorsTable: TTable = {
	headers: [TTableCellName.Name, TTableCellName.LastUpdated, TTableCellName.AdminAction],
	cells: [nameCell, lastUpdatedAtCell, faqAdminActionCell]
};
