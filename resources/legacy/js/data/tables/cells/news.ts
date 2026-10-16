import { AdminNewsActionCell } from "../../../components/tables/AdminNewsActionCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const newsAdminActionCell: TTableCell = {
	id: TTableCellName.AdminAction,
	Component: AdminNewsActionCell
};
