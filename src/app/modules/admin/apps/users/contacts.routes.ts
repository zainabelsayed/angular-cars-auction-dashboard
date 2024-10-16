import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ContactsComponent } from 'app/modules/admin/apps/users/contacts.component';
import { ContactsService } from 'app/modules/admin/apps/users/contacts.service';
import { ContactsDetailsComponent } from 'app/modules/admin/apps/users/details/details.component';
import { ContactsListComponent } from 'app/modules/admin/apps/users/list/list.component';

/**
 * Contact resolver
 *
 * @param route
 * @param state
 */

const userParams = {
    page: 1,
    size: 10,
    sort: 'id',
    order: 'asc' as any,
    search: '',
    userType: 'web' as any,
    status: '',
    guard: '',
};

export default [
    {
        path: '',
        component: ContactsComponent,
        resolve: {},
        children: [
            {
                path: '',
                component: ContactsListComponent,
                resolve: {
                    contacts: () =>
                        inject(ContactsService).getUsers(userParams),
                    countries: () => inject(ContactsService).getCountries(),
                },
                children: [
                    {
                        path: ':id',
                        component: ContactsDetailsComponent,
                        resolve: {
                            countries: () =>
                                inject(ContactsService).getCountries(),
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
