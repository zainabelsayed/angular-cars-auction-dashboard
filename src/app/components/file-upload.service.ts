// file-upload.service.ts
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    constructor(private storage: AngularFireStorage) {}

    // Uploads a file to Firebase Storage
    // file-upload.service.ts (with progress)
    uploadFile(file: File, path: string): Observable<number | string> {
        const filePath = `${path}/${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, file);

        return new Observable((observer) => {
            uploadTask.percentageChanges().subscribe((progress) => {
                observer.next(progress); // Emit upload progress as a percentage
            });

            uploadTask
                .snapshotChanges()
                .pipe(
                    finalize(() => {
                        fileRef.getDownloadURL().subscribe((downloadURL) => {
                            observer.next(downloadURL); // Emit download URL when upload is complete
                            observer.complete();
                        });
                    })
                )
                .subscribe();
        });
    }
}
