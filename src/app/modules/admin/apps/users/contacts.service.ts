import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ApiCountries,
    ApiRoleList,
    ApiUserData,
    ApiUserResponse,
    CountryItem,
    Nationality,
    NationalityParams,
    UserItem,
    userListParams,
    UserParams,
    UsersPagination,
} from 'app/modules/admin/apps/users/contacts.types';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactsService {
    // Private
    private _user: BehaviorSubject<UserItem | null> = new BehaviorSubject(null);
    private _users: BehaviorSubject<UserItem[] | null> = new BehaviorSubject(
        null
    );
    private _adminUsers: BehaviorSubject<UserItem[] | null> =
        new BehaviorSubject(null);
    private _countries: BehaviorSubject<CountryItem[] | null> =
        new BehaviorSubject(null);
    private _roles: BehaviorSubject<Record<string, string>[]> =
        new BehaviorSubject([]);
    private _pagination: BehaviorSubject<UsersPagination | null> =
        new BehaviorSubject(null);
    private _nationality: BehaviorSubject<Nationality> = new BehaviorSubject(
        null
    );

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
    get user$(): Observable<UserItem> {
        return this._user.asObservable();
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
    get countries$(): Observable<CountryItem[]> {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */

    get pagination$(): Observable<UsersPagination> {
        return this._pagination.asObservable();
    }

    get nationality$(): Observable<Nationality> {
        return this._nationality.asObservable();
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

    getUsers(params: userListParams): Observable<ApiUserResponse> {
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
        const type = userType === 'admin' ? 'admin' : 'user';
        const sortName = sort ? `user.${sort}` : '';
        const roleId = typeof guard === 'number' ? guard : null;
        return this._httpClient
            .post<ApiUserResponse>(
                `http://10.255.254.45:3000/api/dashboard/${type}/search-list?page=${page}&limit=${size}&sortBy=${sortName}&sortOrder=${order}`,
                {
                    keyword: search,
                    status,
                    guard,
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
                    this._users.next(response?.data?.data);
                })
            );
    }

    //get user by id

    getUserById(id, type): Observable<ApiUserData> {
        const userType = type === 'admin' ? 'admin' : 'user';
        const isAdmin = type === 'admin';
        return this._httpClient
            .get<ApiUserData>(
                `http://10.255.254.45:3000/api/dashboard/${userType}/show/${id}`
            )
            .pipe(
                tap((user: ApiUserData) => {
                    this._user.next(
                        isAdmin
                            ? {
                                  ...user.data.admin,
                              }
                            : {
                                  ...user.data.user,
                                  secondPhone:
                                      user.data.user.profile?.second_phone,
                              }
                    );
                    const latestNationality =
                        user.data?.nationalities?.length - 1;
                    this._nationality.next(
                        user.data?.nationalities?.[latestNationality]
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
     * Delete the user
     *
     * @param id
     */
    deleteUser(id: number, type): Observable<any> {
        const userType = type === 'admin' ? 'admin' : 'user';
        const userParams: userListParams = {
            page: 1,
            size: 10,
            sort: 'id',
            order: 'asc' as any,
            search: '',
            userType: userType === 'admin' ? 'admin' : 'web',
            status: '',
            guard: '',
        };
        return this._httpClient
            .delete(
                `http://10.255.254.45:3000/api/dashboard/${userType}/delete/${id}`
            )
            .pipe(switchMap(() => this.getUsers(userParams)));
    }

    /**
     * toggle active user
     *  @param id
     */

    toggleActiveUser(id): Observable<any> {
        return this._httpClient.get<any>(
            `http://10.255.254.45:3000/api/dashboard/user/change-active/${id}`
        );
    }

    /**
     * toggle block user
     *  @param id
     */

    toggleBlockUser(id, type): Observable<any> {
        const userType = type === 'admin' ? 'admin' : 'user';
        return this._httpClient.get<any>(
            `http://10.255.254.45:3000/api/dashboard/${userType}/change-block/${id}`
        );
    }

    /**
     * Get countries
     */
    getCountries(): Observable<ApiCountries> {
        return this._httpClient
            .get<ApiCountries>(
                'http://10.255.254.45:3000/api/dashboard/core/list/countries'
            )
            .pipe(
                tap((countries) => {
                    this._countries.next(countries.data);
                })
            );
    }

    /**
     * add user nationality
     *  @param id
     *  @param params
     */

    addUserNationality(id, params: NationalityParams): Observable<any> {
        return this._httpClient.post<any>(
            `http://10.255.254.45:3000/api/dashboard/user/store/nationality/documents/${id}`,
            params
        );
    }

    /**
     * update user
     *  @param id
     *  @param params
     */

    updateUser(id, params: UserParams, type): Observable<any> {
        const userType = type === 'admin' ? 'admin' : 'user';
        const userParams: userListParams = {
            page: 1,
            size: 10,
            sort: 'id',
            order: 'asc' as any,
            search: '',
            userType: userType === 'admin' ? 'admin' : 'web',
            status: '',
            guard: '',
        };
        const isEdit = !!id && id !== 'new';
        return isEdit
            ? this._httpClient
                  .patch<any>(
                      `http://10.255.254.45:3000/api/dashboard/${userType}/update/${id}`,
                      params
                  )
                  .pipe(switchMap(() => this.getUserById(id, type)))
                  .pipe(switchMap(() => this.getUsers(userParams)))
            : this._httpClient
                  .post<any>(
                      `http://10.255.254.45:3000/api/dashboard/${userType}/store`,
                      params
                  )
                  .pipe(switchMap(() => this.getUserById(id, type)))
                  .pipe(switchMap(() => this.getUsers(userParams)));
    }
}
