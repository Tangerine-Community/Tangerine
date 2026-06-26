import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tangy-svg-logo',
    templateUrl: './tangy-svg-logo.component.html',
    styleUrls: ['./tangy-svg-logo.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TangySvgLogoComponent {
  @Input() tangyLogoStyle;
  constructor() { }

}
