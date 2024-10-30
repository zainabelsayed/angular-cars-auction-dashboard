/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'nav.title',
        subtitle: 'nav.subtitle',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'apps.contacts',
                title: 'nav.users',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/apps/users',
            },
            {
                id: 'apps.cars',
                title: 'nav.cars',
                type: 'collapsable',
                icon: 'heroicons_outline:truck',
                children: [
                    {
                        id: 'apps.cars.inventory',
                        title: 'nav.inventory',
                        type: 'basic',
                        link: '/apps/cars/inventory',
                    },
                ],
            },
        ],
    },
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'Apps',
        tooltip: 'Apps',
        type: 'aside',
        icon: 'heroicons_outline:squares-2x2',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'APPS',
        type: 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'Apps',
        type: 'group',
        icon: 'heroicons_outline:squares-2x2',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
