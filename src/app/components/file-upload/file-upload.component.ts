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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { isNotImage } from 'app/modules/admin/apps/users/utils';
import { finalize } from 'rxjs/operators';

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
        private storage: AngularFireStorage,
        private _detectChanges: ChangeDetectorRef
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
            const filePath = `uploads/${Date.now()}_${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            task.percentageChanges().subscribe((percent) => {
                if (percent < 100) {
                    this.uploadPercentages[index] = percent + 10;
                } else {
                    this.uploadPercentages[index] = percent ?? 0;
                }
                this._detectChanges.detectChanges();
            });

            task.snapshotChanges()
                .pipe(
                    finalize(() => {
                        fileRef.getDownloadURL().subscribe((url) => {
                            this.downloadURLs.push(url);
                            this.emitUploadComplete();
                            this._detectChanges.detectChanges();
                        });
                    })
                )
                .subscribe();
        }
    }

    private emitUploadComplete() {
        this.uploadComplete.emit(this.downloadURLs);
    }
}
