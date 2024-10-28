import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { ContactsComponent } from 'app/modules/admin/apps/users/contacts.component';
import { ContactsService } from 'app/modules/admin/apps/users/contacts.service';
import { ContactsDetailsComponent } from 'app/modules/admin/apps/users/details/details.component';
import { ContactsListComponent } from 'app/modules/admin/apps/users/list/list.component';
import { TranslationLoaderGuard } from 'app/translation-guard.service';

const userParams = {
    page: 1,
    size: 10,
    sort: 'id',
    order: 'asc' as const,
    search: '',
    userType: 'web' as const,
    status: '',
    guard: '',
};

// Can deactivate contacts details
const canDeactivateContactsDetails = (
    component: ContactsDetailsComponent,
    _: ActivatedRouteSnapshot,
    __: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    let nextRoute: ActivatedRouteSnapshot | null = nextState.root;
    while (nextRoute?.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    return nextState.url.includes('/contacts')
        ? !nextRoute?.paramMap.get('id') && component.toggleDrawer()
        : true;
};

// Resolver functions
const resolveContacts = () => inject(ContactsService).getUsers(userParams);
const resolveCountries = () => inject(ContactsService).getCountries();

export default [
    {
        path: '',
        component: ContactsComponent,
        resolve: {},
        children: [
            {
                path: '',
                component: ContactsListComponent,
                canActivate: [TranslationLoaderGuard],
                resolve: {
                    contacts: resolveContacts,
                    countries: resolveCountries,
                },
                children: [
                    {
                        path: ':id',
                        component: ContactsDetailsComponent,
                        canActivate: [TranslationLoaderGuard],
                        resolve: {
                            countries: resolveCountries,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
