import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CustomPaginatorIntl extends MatPaginatorIntl {
    changes = new Subject<void>();

    constructor(private translate: TranslateService) {
        super();
        this.getTranslations();
    }

    getTranslations() {
        this.translate
            .stream([
                'paginator.itemsPerPageLabel',
                'paginator.nextPageLabel',
                'paginator.previousPageLabel',
                'paginator.rangeLabel',
            ])
            .subscribe((translations) => {
                this.itemsPerPageLabel =
                    translations['paginator.itemsPerPageLabel'];
                this.nextPageLabel = translations['paginator.nextPageLabel'];
                this.previousPageLabel =
                    translations['paginator.previousPageLabel'];
                this.getRangeLabel = (
                    page: number,
                    pageSize: number,
                    length: number
                ) => {
                    const startIndex = page * pageSize;
                    const endIndex = Math.min(startIndex + pageSize, length);
                    return this.translate.instant('paginator.rangeLabel', {
                        start: startIndex + 1,
                        end: endIndex,
                        length: length,
                    });
                };

                this.changes.next();
            });
    }
}
