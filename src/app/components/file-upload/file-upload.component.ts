import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { isNotImage } from 'app/modules/admin/apps/users/utils';
import { FileUploadService } from '../file-upload.service';
import { ImageComponent } from '../image/image.component';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        AngularFireStorageModule,
        MatIconModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        ImageComponent,
    ],
})
export class FileUploadComponent implements OnInit {
    @Input() maxFiles: number = 5;
    @Input() title: string = 'Add Docs';
    @Input() uploadedDocs?: string[] = [];
    @Output() uploadComplete = new EventEmitter<string[]>();

    form: FormGroup;
    uploadPercentages: number[] = [];
    downloadURLs: string[] = [];
    isFile = isNotImage;

    constructor(
        private fb: FormBuilder,
        private uploadFileService: FileUploadService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            files: this.fb.array([]),
        });
    }
    ngOnInit(): void {
        if (this.uploadedDocs?.length > 0) {
            this.addFileControl();
            this.downloadURLs = [...this.uploadedDocs];
        }
    }

    get files(): FormArray {
        return this.form.get('files') as FormArray;
    }

    addFileControl() {
        if (this.files.length < this.maxFiles) {
            this.files.push(
                this.fb.group({
                    file: ['', Validators.required],
                })
            );
        }
    }

    removeFileControl(index: number) {
        this.files.removeAt(index);
    }

    onFileSelected(event: any, index: number) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFileService
                .uploadFile(file, 'files')
                .subscribe((percent) => {
                    if (typeof percent === 'string') {
                        this.downloadURLs.push(percent);
                        this.emitUploadComplete();
                        this._changeDetectorRef.detectChanges();
                    }
                    if (typeof percent === 'number' && percent !== 100) {
                        this.uploadPercentages[index] += 10;
                    }
                    if (typeof percent === 'number') {
                        this.uploadPercentages[index] = percent;
                    }
                });
        }
    }

    private emitUploadComplete() {
        this.uploadComplete.emit(this.downloadURLs);
    }
}
