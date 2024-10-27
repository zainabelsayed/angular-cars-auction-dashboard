interface ConfirmationActions {
    show?: boolean;
    label?: string;
    color?: string;
}

export interface ConfirmationData {
    title: string;
    message: string;
    disableClose?: boolean;
    actions?: {
        confirm: ConfirmationActions;
        cancel: ConfirmationActions;
    };
}
