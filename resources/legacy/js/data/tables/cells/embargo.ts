import { AdminEmbargoExtensionActionCell } from "../../../components/tables/AdminEmbargoExtensionActionCell";
import { RichTextCell } from "../../../components/tables/RichTextCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const embargoExtensionAdminActionCell: TTableCell = {
	id: TTableCellName.AdminAction,
	Component: AdminEmbargoExtensionActionCell,
	value: ""
};

export const reasonCell: TTableCell = {
	id: TTableCellName.Reason,
	Component: RichTextCell,
	value: ""
};
