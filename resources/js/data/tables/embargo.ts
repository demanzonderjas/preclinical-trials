import { TTable, TTableCellName } from "../../typings/tables";
import { embargoExtensionAdminActionCell, reasonCell } from "./cells/embargo";
import { adminActionCell, idCell, publishStatusCell } from "./cells/protocol";
import { createdAtCell } from "./cells/users";

export const embargoExtensionsTable: TTable = {
	headers: [
		TTableCellName.ID,
		TTableCellName.CreatedAt,
		TTableCellName.PublishStatus,
		TTableCellName.Reason,
		TTableCellName.AdminAction
	],
	cells: [idCell, createdAtCell, publishStatusCell, reasonCell, embargoExtensionAdminActionCell]
};
