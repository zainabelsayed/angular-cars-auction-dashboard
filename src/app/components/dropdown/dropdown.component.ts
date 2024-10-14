import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputOption } from 'app/modules/admin/apps/users/contacts.types';

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, CommonModule],
})
export class DropdownComponent {
    @Input() options: InputOption[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() selectedValue: string | undefined;

    @Output() selectionChange = new EventEmitter<string>();

    onSelectionChange(value: string) {
        this.selectionChange.emit(value);
    }
}
