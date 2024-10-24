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
            .stream(['paginator.itemsPerPageLabel'])
            .subscribe((translations) => {
                this.itemsPerPageLabel =
                    translations['paginator.itemsPerPageLabel'];

                this.changes.next();
            });
    }
}
