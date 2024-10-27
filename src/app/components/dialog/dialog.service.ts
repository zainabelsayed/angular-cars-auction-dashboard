import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';
import { ConfirmationData } from './types';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog) {}

    openConfirmDialog({
        title,
        message,
        disableClose = false,
        actions = {
            confirm: {
                show: true,
                label: 'Confirm',
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Cancel',
            },
        },
    }: ConfirmationData) {
        return this.dialog.open(DialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                disableClose,
                actions,
            },
            disableClose,
        });
    }
}
