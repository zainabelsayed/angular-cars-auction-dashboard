import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
} from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseConfirmationService } from '@fuse/services/confirmation';

import { FileUploadService } from 'app/components/file-upload.service';
import { FileUploadComponent } from 'app/components/file-upload/file-upload.component';
import { SnackbarService } from 'app/components/snackbar.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { DropdownComponent } from '../../../../../components/dropdown/dropdown.component';
import { ContactsService } from '../contacts.service';
import {
    InputOption,
    Nationality,
    NationalityParams,
    UserItem,
    UserParams,
} from '../contacts.types';
import { isNotImage } from '../utils';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        NgClass,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TextFieldModule,
        FuseFindByKeyPipe,
        DatePipe,
        DropdownComponent,
        CommonModule,
        FileUploadComponent,
    ],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
    @Input() type: 'admin' | 'web';
    @Input() toggleDrawer: () => void;
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    user: UserItem;
    contactForm: UntypedFormGroup;
    userId: string;
    nationality: Nationality;
    isFile = isNotImage;
    uploadedFiles: string[] = [];
    addNationality: boolean = false;
    nationalities: InputOption[] = [];
    selectedNationality: string | number | undefined;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private snackbarService: SnackbarService,
        private uploadFileService: FileUploadService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the contact form
        this.contactForm = this._formBuilder.group({
            id: [''],
            avatarUrl: [null],
            name: ['', [Validators.required]],
            email: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            secondPhone: [''],
            guard: ['', [Validators.required]],
            nationality: [''],
        });

        //get user id
        this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this._activatedRoute?.firstChild?.paramMap?.subscribe(
                    (params) => {
                        this.userId = params.get('id');
                        this.getUserData();
                    }
                );
            });

        // Get the user
        this._contactsService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UserItem) => {
                // Get the user
                this.user = user;

                // Patch values to the form
                this.contactForm.patchValue(user);

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._contactsService.nationality$.subscribe(
            (nationality: Nationality) => {
                this.nationality = nationality;
                this.selectedNationality = nationality?.nationality?.id;
                this.uploadedFiles = nationality?.attachments?.map(
                    (attachment) => attachment?.content
                );
            }
        );

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

    getUserData() {
        if (this.userId) {
            this._contactsService
                .getUserById(this.userId, this.type)
                .subscribe((user) => {
                    this.user =
                        this.type === 'admin'
                            ? user?.data?.admin
                            : user?.data?.user;
                });

            this._changeDetectorRef.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.userId = this._activatedRoute?.firstChild?.snapshot?.params?.id;
        this.getUserData();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onUploadComplete(fileURLs: string[]) {
        this.uploadedFiles = fileURLs;
        this._changeDetectorRef.detectChanges();
    }

    toggleNationality() {
        this.addNationality = !this.addNationality;
    }

    onNationalityChange(value) {
        this.selectedNationality = value;
    }

    saveNationality() {
        const existedDocs = this.nationality?.attachments?.map(
            (nationality) => nationality.content
        );
        const attachments = this.uploadedFiles?.filter(
            (file) => !existedDocs?.includes(file)
        );
        const params: NationalityParams = {
            nationalityId: this.selectedNationality as number,
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
            guard: contact.guard,
            nationalityId: contact.nationality.id,
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
                        message: 'Something went wrong!',
                        action: 'Close',
                        panelClass: 'error-snackbar',
                    });
                }
            });
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
                // Get the current contact's id
                const id = this.user.id;

                // Delete the contact
                this._contactsService
                    .deleteUser(id, this.type)
                    .subscribe((isDeleted) => {
                        // Return if the contact wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Otherwise, navigate to the parent
                        else {
                            this._router.navigate(['./'], {
                                relativeTo: this._activatedRoute,
                            });
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
        this.contactForm.setValue({
            ...this.contactForm.value,
            avatarUrl: null,
        });
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
}
