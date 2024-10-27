import { AsyncPipe, CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/components/dialog/dialog.service';
import { SnackbarService } from 'app/components/snackbar.service';
import { Observable, Subject, map, merge, switchMap, takeUntil } from 'rxjs';
import { InventoryPagination } from '../../cars/inventory/inventory.types';
import { ContactsService } from '../contacts.service';
import { UserItem } from '../contacts.types';

@Component({
    selector: 'app-users-table',
    standalone: true,
    imports: [
        CommonModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule,
        AsyncPipe,
    ],
    templateUrl: './users-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent implements AfterViewInit, OnInit {
    @Input() users$: Observable<UserItem[]>;
    @Input() tableHead: { id: string; name$: Observable<any> }[] = [];
    @Input() pagination: InventoryPagination;
    @Input() activeTabIndex: 'web' | 'admin' = 'web';
    @Input() toggleDetails: () => void;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;
    locale: string = this.translate.currentLang;

    isAdminUsers = false;
    gridClass = `grid-cols-7`;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _dialogService: DialogService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private translate: TranslateService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit(): void {
        this.isAdminUsers = this.activeTabIndex === 'admin';
        this._changeDetectorRef.markForCheck();
        this.gridClass = `grid-cols-${this.tableHead.length + 1}`;
        this.translate.onLangChange.subscribe((event) => {
            this.locale = event.lang;
            this._changeDetectorRef.markForCheck();
        });
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: this._sort?.active,
                start: 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;

                    // Close the details
                });

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._contactsService.getUsers({
                            page: this._paginator.pageIndex + 1,
                            size: this._paginator.pageSize,
                            sort: this._sort.active,
                            order: this._sort.direction,
                            userType:
                                this.activeTabIndex === 'admin'
                                    ? 'admin'
                                    : 'web',
                        });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
    }

    toggleBlock(id: string, e): void {
        e.stopPropagation();
        this._contactsService
            .toggleBlockUser(id, this.activeTabIndex)
            .subscribe({
                next: () => {
                    this.updateUsersList();
                },
                error: (err) => {
                    this.snackbarService.show({
                        message: err.error.message,
                        action: 'OK',
                        panelClass: 'error-snackbar',
                    });
                },
            });
    }

    toggleActive(id: string, e): void {
        e.stopPropagation();
        this._contactsService.toggleActiveUser(id).subscribe({
            next: () => {
                this.updateUsersList();
            },
            error: (err) => {
                this.snackbarService.show({
                    message: err.error.message,
                    action: 'OK',
                    panelClass: 'error-snackbar',
                });
            },
        });
    }

    openDeleteDialog(user: UserItem, e): void {
        e.stopPropagation();
        const dialogRef = this._dialogService.openConfirmDialog({
            title: this.translate.instant('users.delete.title'),
            message: this.translate.instant('users.delete.message', {
                name: user.name,
            }),
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._contactsService
                    .deleteUser(user.id, this.activeTabIndex)
                    .subscribe({
                        next: () => {
                            this.updateUsersList();
                            this.snackbarService.show({
                                message: 'Deleted successfully!',
                                action: 'OK',
                                panelClass: 'success-snackbar',
                            });
                        },
                        error: (err) => {
                            this.snackbarService.show({
                                message: err.error.message,
                                action: 'OK',
                                panelClass: 'error-snackbar',
                            });
                        },
                    });
            } else {
                console.log('Cancelled');
            }
        });
    }

    openDetails(id): void {
        this._router
            .navigate([`./${id}`], {
                relativeTo: this._activatedRoute,
            })
            .then((res) => {
                if (res) {
                    this.toggleDetails();
                }
            });
    }

    updateUsersList() {
        this._contactsService
            .getUsers({
                page: 1,
                size: this.pagination.size,
                sort: this._sort?.active,
                order: 'asc',
                userType: this.activeTabIndex === 'admin' ? 'admin' : 'web',
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
