import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tangy-svg-logo',
  templateUrl: './tangy-svg-logo.component.html',
  styleUrls: ['./tangy-svg-logo.component.css']
})
export class TangySvgLogoComponent implements OnInit {
  @Input() tangyLogoStyle;
  constructor() { }

  ngOnInit() {
  }

}
