import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tangy-tooltip',
  templateUrl: './tangy-tooltip.component.html',
  styleUrls: ['./tangy-tooltip.component.css']
})
export class TangyTooltipComponent implements OnInit {
  @Input() tangyToolTipText;
  @Input() truncateLength;
  constructor() { }

  ngOnInit() {
  }

}
