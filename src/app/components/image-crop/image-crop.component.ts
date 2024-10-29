import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Inject,
    ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
    selector: 'app-image-crop',
    standalone: true,
    imports: [ImageCropperComponent, CommonModule, TranslateModule],
    templateUrl: './image-crop.component.html',
    styleUrls: [], // Ensure styleUrls is correctly defined
})
export class ImageCropComponent implements AfterViewInit {
    @ViewChild(ImageCropperComponent) cropper: ImageCropperComponent;
    imageChangedEvent: any = '';
    croppedImage: any = '';

    constructor(
        public dialogRef: MatDialogRef<ImageCropComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { event: any }, // Specify data type more explicitly
        private detectChanges: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        if (this.data && this.data.event) {
            this.imageChangedEvent = this.data.event;
            this.detectChanges.detectChanges();
        } else {
            console.error('No image data provided');
        }
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.blob; // Get the cropped image data
        this.detectChanges.detectChanges();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        this.dialogRef.close(this.croppedImage); // Return the cropped image
    }

    imageLoaded(event: any) {
        console.log('Image loaded');
    }

    cropperReady() {
        console.log('Cropper ready');
    }

    loadImageFailed() {
        console.error('Load failed');
    }
}
