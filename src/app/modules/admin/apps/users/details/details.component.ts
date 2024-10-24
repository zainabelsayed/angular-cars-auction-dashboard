import { CommonModule, DatePipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
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
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
} from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { ImageComponent } from '../../../../../components/image/image.component';
import { ContactsService } from '../contacts.service';
import { Nationality, UserItem } from '../contacts.types';
import { UserFormComponent } from '../user-form/user-form.component';
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
        NgClass,
        FuseFindByKeyPipe,
        DatePipe,
        CommonModule,
        ImageComponent,
        UserFormComponent,
        TranslateModule,
    ],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
    @Input() type: 'admin' | 'web';
    @Input() toggleDrawer: () => void;

    editMode: boolean = false;
    user: UserItem;
    contactForm: UntypedFormGroup;
    userId: string;
    nationality: Nationality;
    isFile = isNotImage;
    uploadedFiles: string[] = [];
    selectedNationality: string | number | undefined;
    role: number;
    isNewUser: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _router: Router,
        private _formBuilder: UntypedFormBuilder
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
            guard: [''],
            role: [undefined],
            nationality: [''],
            password: [undefined],
        });
        //get user id
        this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this._activatedRoute?.firstChild?.paramMap?.subscribe(
                    (params) => {
                        this.userId = params.get('id');
                        if (this.userId === 'new') {
                            this.editMode = true;
                        }
                        this.isNewUser = this.userId === 'new';
                        this.getUserData();
                        this.getNationality();
                        this._changeDetectorRef.markForCheck();
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
    }

    getNationality() {
        if (!this.isNewUser && this.userId) {
            this._contactsService.nationality$.subscribe(
                (nationality: Nationality) => {
                    this.nationality = nationality;
                    this.selectedNationality = nationality?.nationality?.id;
                    this.uploadedFiles = nationality?.attachments?.map(
                        (attachment) => attachment?.content
                    );
                    this._changeDetectorRef.detectChanges();
                }
            );
        } else {
            this.nationality = null;
            this.selectedNationality = null;
        }
    }

    getUserData() {
        if (!this.isNewUser && this.userId) {
            this._contactsService
                .getUserById(this.userId, this.type)
                .subscribe((user) => {
                    this.user =
                        this.type === 'admin'
                            ? user?.data?.admin
                            : user?.data?.user;
                    this.role = user?.data?.admin?.role?.id;
                    this.contactForm.get('role').setValue(this.role);
                });

            this._changeDetectorRef.markForCheck();
        } else {
            this.user = null;
            this.contactForm.reset();
            this._changeDetectorRef.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.userId = this._activatedRoute?.firstChild?.snapshot?.params?.id;
        this.getUserData();
        this.getNationality();
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

    onRoleChange(value) {
        this.role = value;
        this.contactForm.get('role').setValue(this.role);
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
