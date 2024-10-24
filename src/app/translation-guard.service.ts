import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TranslationService } from './translation.service';

@Injectable()
export class TranslationLoaderGuard {
    constructor(
        private translate: TranslateService,
        private languageService: TranslationService
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return new Observable((observer) => {
            this.translate.get('last.dummy').subscribe({
                next: () => {
                    observer.next(true);
                },
                error: (error) => {
                    observer.next(false);
                    observer.error(error);
                },
                complete: () => {
                    observer.complete();
                },
            });
        });
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return new Observable((observer) => {
            this.translate.get('last.dummy').subscribe({
                next: () => {
                    observer.next(true);
                },
                error: (error) => {
                    observer.next(false);
                    observer.error(error);
                },
                complete: () => {
                    observer.complete();
                },
            });
        });
    }
}
