import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class DropdownComponent {
    @Input() options: string[] = [];
    @Input() placeholder: string = 'Select an option';
    @Output() optionSelected = new EventEmitter<string>();

    isOpen = false;
    selectedOption: string | null = null;

    toggleDropdown(): void {
        this.isOpen = !this.isOpen;
    }

    selectOption(option: string): void {
        this.selectedOption = option;
        this.optionSelected.emit(option);
        this.isOpen = false; // Close the dropdown after selection
    }

    closeDropdown(): void {
        this.isOpen = false;
    }
}
