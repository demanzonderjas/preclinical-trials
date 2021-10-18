export type TModal = {
    header?: string;
    description?: string;
    Component?: React.FC;
    props?: any;
    handleConfirm: Function;
    align?: string;
    isDefault?: boolean;
};
