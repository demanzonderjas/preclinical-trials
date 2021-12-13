import { TTable, TTableCellName } from "../../typings/tables";
import { menuTitleCell, pagesAdminActionCell } from "./cells/pages";
import { lastUpdatedAtCell, titleCell } from "./cells/protocol";

export const pagesTable: TTable = {
	headers: [
		TTableCellName.MenuTitle,
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.AdminAction
	],
	cells: [menuTitleCell, titleCell, lastUpdatedAtCell, pagesAdminActionCell]
};
