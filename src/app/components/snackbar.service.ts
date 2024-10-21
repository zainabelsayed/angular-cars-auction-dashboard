import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBar } from './types';

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    show({
        message,
        action = 'Close',
        duration = 3000,
        panelClass = 'info-snackbar',
    }: SnackBar) {
        this.snackBar.open(message, action, {
            duration: duration, // The length of time in milliseconds to show the snack bar
            verticalPosition: 'top', // Can be 'top' or 'bottom'
            horizontalPosition: 'center', // Can be 'start', 'center', 'end', 'left', or 'right'
            panelClass,
        });
    }
}
