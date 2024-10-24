import { NgClass, NgTemplateOutlet } from '@angular/common';
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
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownComponent } from 'app/components/dropdown/dropdown.component';
import {
    InventoryPagination,
    InventoryProduct,
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
import { InputOption, UserItem } from '../contacts.types';
import { ContactsDetailsComponent } from '../details/details.component';
import { UsersTableComponent } from '../users-table/users-table.component';
import { ExcelExportService } from '../utils';

@Component({
    selector: 'contacts-list',
    templateUrl: './list.component.html',
    styles: [],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgTemplateOutlet,
        NgClass,
        MatSlideToggleModule,
        MatTabsModule,
        UsersTableComponent,
        DropdownComponent,
        MatSidenavModule,
        ContactsDetailsComponent,
        TranslateModule,
    ],
})
export class ContactsListComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild(MatDrawer) drawer: MatDrawer;

    users$: Observable<UserItem[]>;
    adminRoles: InputOption[];

    isLoading: boolean = false;
    pagination: InventoryPagination;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: InventoryProduct | null = null;
    selectedProductForm: UntypedFormGroup;
    tableHead: { id: string; name$: Observable<any> }[];
    adminTableHead: { id: string; name$: Observable<any> }[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    activeTabIndex: number = 0;
    selectedStatusOption: string | undefined;
    selectedRoleOption: string | undefined;
    drawerMode: 'side' | 'over';
    toggleDrawer: () => void;

    statusOptions = [
        {
            value: 'active',
            label$: this.translate.stream('users.status.active'),
        },
        {
            value: 'inactive',
            label$: this.translate.stream('users.status.inactive'),
        },
        {
            value: 'blocked',
            label$: this.translate.stream('users.status.blocked'),
        },
        {
            value: 'unblocked',
            label$: this.translate.stream('users.status.unblocked'),
        },
    ];

    webRolesOptions = [
        {
            value: 'user',
            label$: this.translate.stream('users.roles.individual'),
        },
        {
            value: 'org',
            label$: this.translate.stream('users.roles.organization'),
        },
    ];

    roleOptions: { value: string; label$: Observable<any> }[] =
        this.webRolesOptions;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private translate: TranslateService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.tableHead = [
            { name$: this.translate.stream('users.th.image'), id: 'id' },
            { name$: this.translate.stream('users.th.name'), id: 'name' },
            {
                name$: this.translate.stream('users.th.verified'),
                id: 'isVerified',
            },
            { name$: this.translate.stream('users.th.status'), id: 'isActive' },
            {
                name$: this.translate.stream('users.th.blocked'),
                id: 'isBlocked',
            },
            {
                name$: this.translate.stream('users.th.lastLogin'),
                id: 'lastLoginAt',
            },
        ];

        this.adminTableHead = [
            { name$: this.translate.stream('users.th.image'), id: 'id' },
            { name$: this.translate.stream('users.th.name'), id: 'name' },
            { name$: this.translate.stream('users.th.role'), id: 'role' },
            {
                name$: this.translate.stream('users.th.blocked'),
                id: 'isBlocked',
            },
            {
                name$: this.translate.stream('users.th.lastLogin'),
                id: 'lastLoginAt',
            },
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

        this._contactsService.getRoles().subscribe((roles) => {
            this.adminRoles = roles.data.data.map((role) => ({
                value: role.id,
                label: role.title,
            }));
        });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._contactsService.getUsers({
                        page: this.pagination.page + 1,
                        size: this.pagination.size,
                        sort: this._sort?.active,
                        order: 'asc',
                        userType: this.activeTabIndex === 1 ? 'admin' : 'web',
                        search: query,
                    });
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    addUser() {
        this._router.navigate(['new'], {
            relativeTo: this._activatedRoute,
        });
        this.drawer.toggle();
    }

    ngAfterViewInit(): void {
        this.onTabChange;
        this.toggleDrawer = () => {
            this.drawer.toggle();
        };
        const shouldDrawerOpen =
            !!this._activatedRoute.firstChild?.snapshot?.params['id'];
        if (shouldDrawerOpen && !this.drawer.opened) {
            this.drawer.toggle();
        }
    }

    resetFilters() {
        this.selectedRoleOption = null;
        this.selectedStatusOption = null;
        this.updateUsersList();
    }

    exportToExcel() {
        let tableData: any[] = [];
        this.users$.subscribe((users) => {
            tableData = users.map((user) => ({
                Image: user.avatarUrl,
                Name: user.name,
                Verified: user.isVerified,
                Status: user.isActive
                    ? this.translate.instant('users.active')
                    : this.translate.instant('users.inactive'),
                LastLogin: user.lastLoginAt,
                Role: user?.guard,
                Blocked: user.isBlocked
                    ? this.translate.instant('common.text.yes')
                    : this.translate.instant('common.text.no'),
            }));
        });
        ExcelExportService.exportToExcel('users', tableData);
    }

    onStatusChange(value: string) {
        this.selectedStatusOption = value;
        this.updateUsersList();
    }

    onRoleChange(value: string) {
        this.selectedRoleOption = value;
        this.updateUsersList();
    }

    onTabChange(event: MatTabChangeEvent): void {
        this.activeTabIndex = event.index;
        this._changeDetectorRef.markForCheck();
        this.updateUsersList();
        this.selectedRoleOption = null;
        this.selectedStatusOption = null;
        if (this.activeTabIndex === 1) {
            (this.roleOptions as any) = this.adminRoles;
        } else {
            this.roleOptions = this.webRolesOptions;
        }
    }

    updateUsersList() {
        this._contactsService
            .getUsers({
                page: 1,
                size: this.pagination.size,
                sort: this._sort?.active,
                order: 'asc',
                userType: this.activeTabIndex === 1 ? 'admin' : 'web',
                guard: this.selectedRoleOption,
                status: this.selectedStatusOption,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this.drawer.toggle();

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
