import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AvailableLangs } from '@ngneat/transloco';
import { TranslationService } from 'app/translation.service';
import { languageOptions } from './data';

@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet],
})
export class LanguagesComponent implements OnInit, OnDestroy {
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translationService: TranslationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the available languages from transloco
        this.availableLangs = languageOptions;

        // Get the active lang
        this.activeLang = localStorage.getItem('lng') || 'en';

        // Set the country iso codes for languages for flags
        this.flagCodes = {
            en: 'us',
            ar: 'ar',
            ku: 'ku',
            or: 'or',
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void {
        // Set the active lang
        this._translationService.changeLang(lang);
        this.activeLang = lang;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
