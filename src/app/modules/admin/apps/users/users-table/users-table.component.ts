import { CommonModule } from '@angular/common';
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
import { DialogService } from 'app/components/dialog/dialog.service';
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
    ],
    templateUrl: './users-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent implements AfterViewInit, OnInit {
    @Input() users$: Observable<UserItem[]>;
    @Input() tableHead: Record<string, string>[] = [];
    @Input() pagination: InventoryPagination;
    @Input() activeTabIndex: 'web' | 'admin' = 'web';
    @Input() toggleDetails: () => void;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;

    isAdminUsers = false;
    gridClass = `grid-cols-7`;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _dialogService: DialogService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.isAdminUsers = this.activeTabIndex === 'admin';
        this._changeDetectorRef.markForCheck();
        this.gridClass = `grid-cols-${this.tableHead.length + 1}`;
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
            .subscribe(() => {
                this.updateUsersList();
            });
    }

    toggleActive(id: string, e): void {
        e.stopPropagation();
        this._contactsService.toggleActiveUser(id).subscribe(() => {
            this.updateUsersList();
        });
    }

    openDeleteDialog(user: UserItem, e): void {
        e.stopPropagation();
        const dialogRef = this._dialogService.openConfirmDialog(
            'Confirm Delete',
            `Are you sure you want to delete ${user.name} ?`
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._contactsService
                    .deleteUser(user.id, this.activeTabIndex)
                    .subscribe(() => {
                        this.updateUsersList();
                    });
                console.log('Confirmed', result);
            } else {
                console.log('Cancelled');
            }
        });
    }

    openDetails(id): void {
        this.toggleDetails();
        this._router.navigate([`./${id}`], {
            relativeTo: this._activatedRoute,
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
