import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import {
    AngularFireStorage,
    AngularFireStorageModule,
} from '@angular/fire/compat/storage';
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
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        AngularFireStorageModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class FileUploadComponent {
    @Input() maxFiles: number = 5;
    @Output() uploadComplete = new EventEmitter<string[]>();

    form: FormGroup;
    uploadPercentages: number[] = [];
    downloadURLs: string[] = [];

    constructor(
        private fb: FormBuilder,
        private storage: AngularFireStorage
    ) {
        this.form = this.fb.group({
            files: this.fb.array([]),
        });
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
            const filePath = `uploads/${Date.now()}_${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            task.percentageChanges().subscribe((percent) => {
                this.uploadPercentages[index] = percent ?? 0;
            });

            task.snapshotChanges()
                .pipe(
                    finalize(() => {
                        fileRef.getDownloadURL().subscribe((url) => {
                            this.downloadURLs[index] = url;
                            this.emitUploadComplete();
                        });
                    })
                )
                .subscribe();
        }
    }

    private emitUploadComplete() {
        if (this.downloadURLs.length === this.files.length) {
            this.uploadComplete.emit(this.downloadURLs);
        }
    }
}
