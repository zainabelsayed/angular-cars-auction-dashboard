import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { rtlLanguages } from './layout/common/languages/data';

@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    defaultLang = 'en';
    isRtl: boolean = true;
    constructor(
        private translateService: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        translateService.addLangs(['ar', 'en', 'ur', 'ku']);
        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem('lng');
            if (savedLang) {
                this.defaultLang = savedLang;
                this.isRtl = rtlLanguages.includes(this.defaultLang)
                    ? true
                    : false;
            }
            this.translateService.setDefaultLang(this.defaultLang);
            this.translateService.use(this.defaultLang);
        }
    }

    changeLang(lang: string) {
        this.translateService.use(lang);
        this.translateService.setDefaultLang(lang);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lng', lang);
            this.isRtl = rtlLanguages.includes(lang) ? true : false;
        }
    }
}
