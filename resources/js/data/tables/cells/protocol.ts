import { ActionCell, EditCell, ViewCell } from "../../../components/tables/ActionCell";
import { AdminProtocolActionCell } from "../../../components/tables/AdminProtocolActionCell";
import { BooleanCell } from "../../../components/tables/BooleanCell";
import { CountryCell } from "../../../components/tables/CountryCell";
import { DateCell } from "../../../components/tables/DateCell";
import { StudyCentreCell } from "../../../components/tables/StudyCentreCell";
import { TextCell } from "../../../components/tables/TextCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const titleCell: TTableCell = {
	id: TTableCellName.Title,
	Component: TextCell,
	value: ""
};

export const studyStatusCell: TTableCell = {
	id: TTableCellName.StudyStatus,
	Component: TextCell,
	value: ""
};

export const lastUpdatedAtCell: TTableCell = {
	id: TTableCellName.LastUpdated,
	Component: DateCell,
	value: "",
	synonym: "updated_at"
};

export const studyCentreCell: TTableCell = {
	id: TTableCellName.StudyCentre,
	Component: StudyCentreCell,
	value: ""
};

export const editCell: TTableCell = {
	id: TTableCellName.Action,
	Component: EditCell,
	value: ""
};

export const viewCell: TTableCell = {
	id: TTableCellName.Action,
	Component: ViewCell,
	value: ""
};

export const actionCell: TTableCell = {
	id: TTableCellName.Action,
	Component: ActionCell,
	value: ""
};

export const armCell: TTableCell = {
	id: TTableCellName.Arm,
	Component: TextCell,
	value: ""
};

export const numberCell: TTableCell = {
	id: TTableCellName.Number,
	Component: TextCell,
	value: ""
};

export const interventionCell: TTableCell = {
	id: TTableCellName.Intervention,
	Component: TextCell,
	value: ""
};

export const nameCell: TTableCell = {
	...titleCell,
	id: TTableCellName.Name
};

export const cityCell: TTableCell = {
	...titleCell,
	id: TTableCellName.City
};

export const countryCell: TTableCell = {
	...titleCell,
	Component: CountryCell,
	id: TTableCellName.Country
};

export const hasEmbargoCell: TTableCell = {
	id: TTableCellName.HasEmbargo,
	Component: BooleanCell,
	value: ""
};

export const publishStatusCell: TTableCell = {
	id: TTableCellName.PublishStatus,
	Component: TextCell,
	value: "",
	synonym: "status"
};

export const adminActionCell: TTableCell = {
	id: TTableCellName.AdminAction,
	Component: AdminProtocolActionCell,
	value: ""
};
