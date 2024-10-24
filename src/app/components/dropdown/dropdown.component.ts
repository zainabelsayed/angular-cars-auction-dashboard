import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputOption } from 'app/modules/admin/apps/users/contacts.types';
import { isObservable } from 'rxjs';

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, CommonModule, AsyncPipe],
})
export class DropdownComponent {
    @Input() options: InputOption[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() selectedValue: string | undefined;

    @Output() selectionChange = new EventEmitter<string>();

    isObservable: (value: any) => boolean = isObservable;

    onSelectionChange(value: string) {
        this.selectionChange.emit(value);
    }
    // Get the currently selected option object
    getSelectedOption() {
        return this.options.find(
            (option) => option.value === this.selectedValue
        );
    }
}
