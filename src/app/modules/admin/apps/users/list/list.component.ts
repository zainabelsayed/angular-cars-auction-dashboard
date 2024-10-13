import {
    AsyncPipe,
    CurrencyPipe,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
    MatTab,
    MatTabChangeEvent,
    MatTabsModule,
} from '@angular/material/tabs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DropdownComponent } from 'app/components/dropdown/dropdown.component';
import { InventoryService } from 'app/modules/admin/apps/cars/inventory/inventory.service';
import {
    InventoryBrand,
    InventoryCategory,
    InventoryPagination,
    InventoryProduct,
    InventoryTag,
    InventoryVendor,
} from 'app/modules/admin/apps/cars/inventory/inventory.types';
import {
    Observable,
    Subject,
    debounceTime,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';
import { ContactsService } from '../contacts.service';
import { UserItem } from '../contacts.types';
import { UsersTableComponent } from '../users-table/users-table.component';

@Component({
    selector: 'contacts-list',
    templateUrl: './list.component.html',
    styles: [
        /* language=SCSS */
        `
            .inventory-grid {
                grid-template-columns: 120px auto 40px;

                @screen sm {
                    grid-template-columns: 120px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 120px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 112px 170px auto 120px 160px 120px;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        NgClass,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        AsyncPipe,
        CurrencyPipe,
        MatTabsModule,
        UsersTableComponent,
        DropdownComponent,
    ],
})
export class ContactsListComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild(MatTab) private _tab: MatTab;

    users$: Observable<UserItem[]>;

    brands: InventoryBrand[];
    categories: InventoryCategory[];
    filteredTags: InventoryTag[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: InventoryPagination;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: InventoryProduct | null = null;
    selectedProductForm: UntypedFormGroup;
    tags: InventoryTag[];
    tagsEditMode: boolean = false;
    vendors: InventoryVendor[];
    tableHead: Record<string, string>[];
    adminTableHead: Record<string, string>[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    activeTabIndex: number = 0;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _inventoryService: InventoryService,
        private _contactsService: ContactsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the selected product form
        this.selectedProductForm = this._formBuilder.group({
            id: [''],
            category: [''],
            name: ['', [Validators.required]],
            description: [''],
            tags: [[]],
            sku: [''],
            barcode: [''],
            brand: [''],
            vendor: [''],
            stock: [''],
            reserved: [''],
            cost: [''],
            basePrice: [''],
            taxPercent: [''],
            price: [''],
            weight: [''],
            thumbnail: [''],
            images: [[]],
            currentImageIndex: [0], // Image index that is currently being viewed
            active: [false],
        });

        this.tableHead = [
            { name: 'Image', id: 'id' },
            { name: 'Name', id: 'name' },
            { name: 'Verified', id: 'isVerified' },
            { name: 'Status', id: 'isActive' },
            { name: 'Last login', id: 'lastLoginAt' },
        ];

        this.adminTableHead = [
            { name: 'Image', id: 'id' },
            { name: 'Name', id: 'name' },
            { name: 'Role', id: 'role' },
            { name: 'Status', id: 'isBlocked' },
            { name: 'Last login', id: 'lastLoginAt' },
        ];

        // Get the pagination
        this._contactsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the products
        this.users$ = this._contactsService.users$;

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._contactsService.getUsers(
                        this.pagination.page + 1,
                        this.pagination.size,
                        this._sort?.active,
                        'asc',
                        this.activeTabIndex === 1 ? 'admin' : 'web',
                        query
                    );
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        this.onTabChange;
    }

    dropdownOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

    onOptionSelected(selected: string): void {
        console.log('Selected option:', selected);
    }

    onTabChange(event: MatTabChangeEvent): void {
        this.activeTabIndex = event.index;
        this._changeDetectorRef.markForCheck();
        this._contactsService
            .getUsers(
                1,
                this.pagination.size,
                this._sort?.active,
                'asc',
                this.activeTabIndex === 1 ? 'admin' : 'web'
            )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle product details
     *
     * @param productId
     */
    toggleDetails(productId: string): void {
        // If the product is already selected...
        if (this.selectedUser && this.selectedUser.id === productId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this._inventoryService
            .getProductById(productId)
            .subscribe((product) => {
                // Set the selected product
                this.selectedUser = product;

                // Fill the form
                this.selectedProductForm.patchValue(product);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedUser = null;
    }

    /**
     * Create product
     */
    createProduct(): void {
        // Create the product
        this._inventoryService.createProduct().subscribe((newProduct) => {
            // Go to new product
            this.selectedUser = newProduct;

            // Fill the form
            this.selectedProductForm.patchValue(newProduct);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected product using the form data
     */
    updateSelectedProduct(): void {
        // Get the product object
        const product = this.selectedProductForm.getRawValue();

        // Remove the currentImageIndex field
        delete product.currentImageIndex;

        // Update the product on the server
        this._inventoryService
            .updateProduct(product.id, product)
            .subscribe(() => {
                // Show a success message
                this.showFlashMessage('success');
            });
    }

    /**
     * Delete the selected product using the form data
     */
    deleteSelectedProduct(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete product',
            message:
                'Are you sure you want to remove this product? This action cannot be undone!',
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
                // Get the product object
                const product = this.selectedProductForm.getRawValue();

                // Delete the product on the server
                this._inventoryService
                    .deleteProduct(product.id)
                    .subscribe(() => {
                        // Close the details
                        this.closeDetails();
                    });
            }
        });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
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
