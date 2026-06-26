import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    template: '<h2>Page not found</h2>',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PageNotFoundComponent {}
