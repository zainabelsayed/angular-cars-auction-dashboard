import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    defaultLang = 'en';

    constructor(
        private translateService: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem('lng');
            if (savedLang) {
                this.defaultLang = savedLang;
            }
            this.translateService.setDefaultLang(this.defaultLang);
            this.translateService.use(this.defaultLang);
        }
    }

    changeLang(lang: string) {
        this.translateService.use(lang);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lng', lang);
        }
    }
}
