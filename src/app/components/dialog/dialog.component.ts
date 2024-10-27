import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { rtlLanguages } from 'app/layout/common/languages/data';
import { ConfirmationData } from './types';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [MatDialogModule, CommonModule, TranslateModule],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
    dir: string = rtlLanguages.includes(this.translate.currentLang)
        ? 'rtl'
        : 'ltr';
    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationData,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event) => {
            this.dir = rtlLanguages.includes(event.lang) ? 'rtl' : 'ltr';
        });
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
