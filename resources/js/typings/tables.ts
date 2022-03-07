import { TFormFieldName } from "./forms";

export type TTable = {
	headers: TTableCellName[];
	targetOnRowClick?: string;
	cells: TTableCell[];
};

export type TTableCell = {
	id: TTableCellName;
	Component: React.FC<any>;
	value?: string;
	props?: any;
	synonym?: TFormFieldName | string;
};

export enum TTableCellName {
	Title = "title",
	MenuTitle = "menu_title",
	StudyStatus = "study_status",
	PublishStatus = "publish_status",
	LastUpdated = "last_updated",
	StudyCentre = "study_centre",
	Action = "action",
	AdminAction = "admin_action",
	HasEmbargo = "has_embargo",
	EmbargoDate = "embargo_date",
	Type = "type",
	Number = "number",
	Intervention = "intervention",
	Name = "name",
	City = "city",
	Country = "country",
	MagicSearch = "magic_search",
	ID = "id"
}

export type TFilter = {
	key?: string;
	value: string;
};

export type TSearchResult = {
	key?: string;
	value: string;
	filterValue: string;
	position: number;
};
