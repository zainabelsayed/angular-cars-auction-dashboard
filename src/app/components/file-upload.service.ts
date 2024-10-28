import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import imageCompression from 'browser-image-compression';
import { Observable, Subscriber } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    constructor(private storage: AngularFireStorage) {}

    // Uploads a file to Firebase Storage
    async uploadFile(
        file: File,
        path: string
    ): Promise<Observable<number | string>> {
        const filePath = `${path}/${file.name}`;
        const fileRef = this.storage.ref(filePath);

        // Create an observable to handle the upload
        return new Observable((observer: Subscriber<number | string>) => {
            // Compress the image before uploading
            this.compressImage(file)
                .then((compressedFile) => {
                    const uploadTask = this.storage.upload(
                        filePath,
                        compressedFile
                    );

                    // Emit upload progress
                    uploadTask.percentageChanges().subscribe((progress) => {
                        observer.next(progress);
                    });

                    // Get download URL once upload is complete
                    uploadTask
                        .snapshotChanges()
                        .pipe(
                            finalize(() => {
                                fileRef
                                    .getDownloadURL()
                                    .subscribe((downloadURL) => {
                                        observer.next(downloadURL);
                                        observer.complete();
                                    });
                            })
                        )
                        .subscribe();
                })
                .catch((error) => {
                    observer.error(error); // Handle any error that occurs during compression
                });
        });
    }

    // Compress the image file
    private async compressImage(file: File): Promise<File> {
        const options = {
            maxSizeMB: 0.5, // Target size in MB (0.5 MB = 500 KB)
            maxWidthOrHeight: 200, // Set max dimensions to reduce file size
            useWebWorker: true, // Use web workers for compression
            initialQuality: 0.8, // Start with quality 80%
        };

        // Perform the compression
        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('Compression failed:', error);
            throw error; // Rethrow error to be handled in the upload flow
        }
    }
}
