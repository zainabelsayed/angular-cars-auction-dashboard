import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ApiRoleList,
    ApiUserResponse,
    Country,
    UserItem,
    userParams,
    UsersPagination,
} from 'app/modules/admin/apps/users/contacts.types';
import {
    BehaviorSubject,
    filter,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<UserItem | null> = new BehaviorSubject(
        null
    );
    private _users: BehaviorSubject<UserItem[] | null> = new BehaviorSubject(
        null
    );
    private _adminUsers: BehaviorSubject<UserItem[] | null> =
        new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(
        null
    );
    private _roles: BehaviorSubject<Record<string, string>[]> =
        new BehaviorSubject([]);
    private _pagination: BehaviorSubject<UsersPagination | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get contact$(): Observable<UserItem> {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get users$(): Observable<UserItem[]> {
        return this._users.asObservable();
    }

    /**
     * Getter for admin users
     */
    get adminUsers$(): Observable<UserItem[]> {
        return this._adminUsers.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */

    get pagination$(): Observable<UsersPagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for roles
     */

    getRolesList(): Observable<Record<string, string>[]> {
        return this._roles.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts
     */

    getUsers(params: userParams): Observable<ApiUserResponse> {
        const {
            page = 1,
            size,
            sort,
            order,
            search,
            userType,
            status = '',
            guard = '',
        } = params;
        const isAdmin = userType === 'admin';
        const sortName = sort ? `user.${sort}` : '';
        return !isAdmin
            ? this._httpClient
                  .post<ApiUserResponse>(
                      `http://10.255.254.45:3000/api/dashboard/user/search-list?page=${page}&limit=${size}&sortBy=${sortName}&sortOrder=${order}`,
                      {
                          keyword: search,
                          status,
                          guard,
                      }
                  )
                  .pipe(
                      tap((response) => {
                          this._pagination.next({
                              length: response?.data?.count,
                              size: 10,
                              page: parseInt(response?.data?.currentPage) - 1,
                              lastPage: response?.data?.totalPages,
                          });
                          this._users.next(response?.data?.data);
                      })
                  )
            : this.getDashboardUsers(params);
    }

    getDashboardUsers(params: userParams): Observable<ApiUserResponse> {
        const { page, size, sort, order, search, status = '', guard } = params;
        const sortName = sort ? `user.${sort}` : '';
        const roleId = typeof guard === 'number' ? guard : null;

        return this._httpClient
            .post<ApiUserResponse>(
                `http://10.255.254.45:3000/api/dashboard/admin/search-list?page=${page}&limit=${size}&sortBy=${sortName}&sortOrder=${order}`,
                {
                    keyword: search,
                    status,
                    roleId,
                }
            )
            .pipe(
                tap((response) => {
                    this._pagination.next({
                        length: response?.data?.count,
                        size: 10,
                        page: parseInt(response?.data?.currentPage) - 1,
                        lastPage: response?.data?.totalPages,
                    });
                    this._users.next(
                        response?.data?.data.map((item) => ({
                            ...item,
                            isActive: item.isBlocked,
                        }))
                    );
                })
            );
    }

    // get roles

    getRoles(): Observable<ApiRoleList> {
        return this._httpClient
            .get<any>(
                'http://10.255.254.45:3000/api/dashboard/role/list?page=1&limit=20&sortBy=id&sortOrder=asc'
            )
            .pipe(
                tap((roles) => {
                    this._roles.next(roles?.data?.data);
                })
            );
    }

    /**
     * Get contact by id
     */
    getContactById(id: string): Observable<UserItem> {
        return this._users.pipe(
            take(1),
            map((contacts) => {
                // Find the contact
                const contact =
                    contacts.find((item) => item.id.toString() === id) || null;

                // Update the contact
                this._contact.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap((contact) => {
                if (!contact) {
                    return throwError(
                        'Could not found contact with id of ' + id + '!'
                    );
                }

                return of(contact);
            })
        );
    }

    /**
     * Create contact
     */
    createContact(): Observable<UserItem> {
        return this.users$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<UserItem>('api/apps/contacts/contact', {})
                    .pipe(
                        map((newContact) => {
                            // Update the contacts with the new contact
                            this._users.next([newContact, ...contacts]);

                            // Return the new contact
                            return newContact;
                        })
                    )
            )
        );
    }

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: string, contact: UserItem): Observable<UserItem> {
        return this.users$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .patch<UserItem>('api/apps/contacts/contact', {
                        id,
                        contact,
                    })
                    .pipe(
                        map((updatedContact) => {
                            // Find the index of the updated contact
                            const index = contacts.findIndex(
                                (item) => item.id.toString() === id
                            );

                            // Update the contact
                            contacts[index] = updatedContact;

                            // Update the contacts
                            this._users.next(contacts);

                            // Return the updated contact
                            return updatedContact;
                        }),
                        switchMap((updatedContact) =>
                            this.contact$.pipe(
                                take(1),
                                filter(
                                    (item) => item && item.id.toString() === id
                                ),
                                tap(() => {
                                    // Update the contact if it's selected
                                    this._contact.next(updatedContact);

                                    // Return the updated contact
                                    return updatedContact;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteUser(id: string): Observable<boolean> {
        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient
                    .delete(
                        `http://10.255.254.45:3000/api/dashboard/user/delete/${id}`
                    )
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted contact
                            const index = users.findIndex(
                                (item) => item.id.toString() === id
                            );

                            // Delete the contact
                            users.splice(index, 1);

                            // Update the contacts
                            this._users.next(users);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }

    /**
     * toggle active user
     *  @param id
     */

    toggleActiveUser(id): Observable<ApiRoleList> {
        return this._httpClient.get<any>(
            `http://10.255.254.45:3000/api/dashboard/user/change-active/${id}`
        );
    }

    /**
     * toggle block user
     *  @param id
     */

    toggleBlockUser(id, type): Observable<ApiRoleList> {
        const userType = type === 'admin' ? 'admin' : 'user';
        return this._httpClient.get<any>(
            `http://10.255.254.45:3000/api/dashboard/${userType}/change-block/${id}`
        );
    }

    /**
     * Get countries
     */
    getCountries(): Observable<Country[]> {
        return this._httpClient
            .get<Country[]>('api/apps/contacts/countries')
            .pipe(
                tap((countries) => {
                    this._countries.next(countries);
                })
            );
    }
}
