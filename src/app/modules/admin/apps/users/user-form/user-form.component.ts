import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DropdownComponent } from 'app/components/dropdown/dropdown.component';
import { FileUploadService } from 'app/components/file-upload.service';
import { FileUploadComponent } from 'app/components/file-upload/file-upload.component';
import { ImageComponent } from 'app/components/image/image.component';
import { SnackbarService } from 'app/components/snackbar.service';
import { Subject } from 'rxjs';
import { ContactsService } from '../contacts.service';
import { InputOption, NationalityParams, UserParams } from '../contacts.types';
import { ContactsDetailsComponent } from '../details/details.component';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTooltipModule,
        MatInputModule,
        ImageComponent,
        FileUploadComponent,
        DropdownComponent,
    ],
    templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
    @Input() contactForm: UntypedFormGroup;
    @Input() type: 'admin' | 'web';
    @Input() isNewUser: boolean;
    @Input() toggleDrawer: () => void;
    @Input() userId: number;

    addNationality: boolean = false;
    selectedNationality: string | number | undefined =
        this._userDetailsComponent.selectedNationality;
    nationalities: InputOption[] = [];
    uploadedFiles: string[] = this._userDetailsComponent.uploadedFiles;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private uploadFileService: FileUploadService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _contactsService: ContactsService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private snackbarService: SnackbarService,
        private _userDetailsComponent: ContactsDetailsComponent
    ) {}
    ngOnInit(): void {
        this._contactsService.countries$.subscribe((countries) => {
            this.nationalities = countries.map((country) => {
                return {
                    label: country.titles[0].title,
                    value: country.country.id,
                    icon: country.media?.content,
                };
            });
        });
    }
    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }
        this.uploadFileService.uploadFile(file, 'avatar').subscribe((url) => {
            this.contactForm.get('avatarUrl')?.setValue(url);
            this._changeDetectorRef.detectChanges();
        });
    }

    removeAvatar() {
        this.contactForm.get('avatarUrl')?.setValue(null);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * Delete the contact
     */
    deleteContact(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete contact',
            message:
                'Are you sure you want to delete this contact? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current user's id
                const id = this.userId;

                // Delete the contact
                this._contactsService
                    .deleteUser(id, this.type)
                    .subscribe((res) => {
                        if ([200, 201].includes(res.statusCode)) {
                            this._router.navigate(['./'], {
                                relativeTo: this._activatedRoute,
                            });
                            this.toggleDrawer();
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Update the contact
     */
    updateContact(): void {
        // Get the contact object
        const contact = this.contactForm.getRawValue();
        const params: UserParams = {
            avatarUrl: contact.avatarUrl || undefined,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            second_phone: contact.secondPhone || undefined,
            guard: contact.guard || this.type,
            nationalityId: contact?.nationality?.id,
            roleId: contact.role,
            password: contact.password === null ? undefined : contact.password,
        };
        this._contactsService
            .updateUser(this.userId, params, this.type)
            .subscribe((res) => {
                if ([200, 201].includes(res.statusCode)) {
                    this.snackbarService.show({
                        message: 'Updated successfully!',
                        action: 'OK',
                        panelClass: 'success-snackbar',
                    });
                } else {
                    this.snackbarService.show({
                        message: res.message,
                        action: 'Close',
                        panelClass: 'error-snackbar',
                    });
                }
                this.toggleEditMode(false);
            });
    }

    toggleNationality() {
        this.addNationality = !this.addNationality;
    }

    onNationalityChange(value) {
        this._userDetailsComponent.selectedNationality = value;
    }

    saveNationality() {
        const existedDocs =
            this._userDetailsComponent.nationality?.attachments?.map(
                (nationality) => nationality.content
            );
        const attachments = this._userDetailsComponent.uploadedFiles?.filter(
            (file) => !existedDocs?.includes(file)
        );
        const params: NationalityParams = {
            nationalityId: this._userDetailsComponent
                .selectedNationality as number,
            attachments: attachments?.map((content) => ({
                documentUrl: content,
                mediaTypes: 'other',
            })),
        };
        this._contactsService
            .addUserNationality(this.userId, params)
            .subscribe((res) => {
                if (res.statusCode === 201) {
                    this.snackbarService.show({
                        message: 'Updated successfully!',
                        action: 'OK',
                        panelClass: 'success-snackbar',
                    });
                } else {
                    this.snackbarService.show({
                        message: 'Something went wrong!',
                        action: 'Close',
                        panelClass: 'error-snackbar',
                    });
                }
            });
        this._changeDetectorRef.markForCheck();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this._userDetailsComponent.editMode =
                !this._userDetailsComponent.editMode;
        } else {
            this._userDetailsComponent.editMode = editMode;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
