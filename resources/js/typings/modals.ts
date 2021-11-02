export type TModal = {
	name: TModalName;
	Component?: React.FC;
};

export enum TModalName {
	LoginModal = "login_modal"
}
