import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tangerine-reports',
  templateUrl: './tangerine-reports.component.html',
  styleUrls: ['./tangerine-reports.component.css']
})
export class TangerineReportsComponent implements AfterContentInit {
  @ViewChild('container') container: ElementRef;
  containerEl:any;
  constructor() { }

  async ngAfterContentInit() {
    this.containerEl = this.container.nativeElement 
    this.containerEl.innerHTML = `<iframe src="/reports" height=2000></iframe>`
  }

}
