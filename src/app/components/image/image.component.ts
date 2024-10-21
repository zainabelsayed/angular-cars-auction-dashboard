import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-image',
    standalone: true,
    imports: [MatProgressSpinnerModule, CommonModule],
    templateUrl: './image.component.html',
})
export class ImageComponent {
    @Input() src!: string; // Image source URL
    @Input() alt: string = 'Image'; // Alt text for the image
    @Input() class?: string = ''; // Additional CSS classes

    isLoading: boolean = true; // Loading state

    // Called when the image is successfully loaded
    onLoad(): void {
        this.isLoading = false; // Hide spinner when image is loaded
    }

    // Called when there's an error loading the image
    onError(): void {
        this.isLoading = false; // Hide spinner on error
    }
}
