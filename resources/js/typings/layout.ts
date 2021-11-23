export type TSubMenuItem = {
	text: string;
	target: string;
};

export enum THeaderStyle {
	Primary = "primary",
	PrimaryWithSubMenu = "primary_with_submenu",
	White = "white"
}

export type TTranslations = { [K in string]: string };
