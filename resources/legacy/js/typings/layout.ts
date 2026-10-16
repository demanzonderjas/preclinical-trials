export type TSubMenu = {
	items: TSubMenuItem[];
	handleClick?: Function;
};

export type TSubMenuItem = {
	text: string;
	target: any;
};

export enum THeaderStyle {
	Primary = "primary",
	PrimaryWithSubMenu = "primary_with_submenu",
	White = "white"
}

export type TTranslations = { [K in string]: string };
