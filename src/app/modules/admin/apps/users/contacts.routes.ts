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

/**
 * Can deactivate contacts details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateContactsDetails = (
    component: ContactsDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute?.firstChild) {
        nextRoute = nextRoute?.firstChild;
    }

    // If the next state doesn't contain '/contacts'
    // it means we are navigating away from the
    // contacts app
    if (!nextState.url.includes('/contacts')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another contact...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.toggleDrawer();
};

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
                canActivate: [TranslationLoaderGuard],
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
                        canActivate: [TranslationLoaderGuard],
                    },
                ],
            },
        ],
    },
] as Routes;
