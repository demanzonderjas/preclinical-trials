import { AdminAmbassadorActionCell } from "../../../components/tables/AdminAmbassadorActionCell";
import { TextCell } from "../../../components/tables/TextCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const ambassadorActionCell: TTableCell = {
	id: TTableCellName.AdminAction,
	Component: AdminAmbassadorActionCell
};

export const geoSearchCell: TTableCell = {
	id: TTableCellName.GeoSearch,
	Component: TextCell
};
