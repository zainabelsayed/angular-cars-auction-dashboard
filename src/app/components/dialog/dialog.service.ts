import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog) {}

    openConfirmDialog(
        title: string,
        message: string,
        disableClose: boolean = false
    ) {
        return this.dialog.open(DialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                disableClose,
            },
            disableClose,
        });
    }
}
