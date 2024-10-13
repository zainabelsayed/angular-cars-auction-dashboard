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
import { Observable, Subject, map, merge, switchMap, takeUntil } from 'rxjs';
import { InventoryPagination } from '../../cars/inventory/inventory.types';
import { ContactsService } from '../contacts.service';
import { UserItem } from '../contacts.types';

@Component({
    selector: 'app-users-table',
    standalone: true,
    imports: [CommonModule, MatPaginatorModule, MatSortModule, MatIconModule],
    templateUrl: './users-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent implements AfterViewInit, OnInit {
    @Input() users$: Observable<UserItem[]>;
    @Input() tableHead: Record<string, string>[] = [];
    @Input() pagination: InventoryPagination;
    @Input() activeTabIndex: 'web' | 'admin' = 'web';

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = false;

    isAdminUsers = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService
    ) {}

    ngOnInit(): void {
        this.isAdminUsers = this.activeTabIndex === 'admin';
        this._changeDetectorRef.markForCheck();
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
                        return this._contactsService.getUsers(
                            this._paginator.pageIndex + 1,
                            this._paginator.pageSize,
                            this._sort.active,
                            this._sort.direction,
                            this.activeTabIndex === 'admin' ? 'admin' : 'web'
                        );
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
