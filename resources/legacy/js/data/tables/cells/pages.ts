import { AdminPageActionCell } from "../../../components/tables/AdminPageActionCell";
import { TextCell } from "../../../components/tables/TextCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const menuTitleCell: TTableCell = {
	id: TTableCellName.MenuTitle,
	Component: TextCell,
	value: ""
};

export const pagesAdminActionCell: TTableCell = {
	id: TTableCellName.AdminAction,
	Component: AdminPageActionCell
};
