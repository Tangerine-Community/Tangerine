import { Directive, ElementRef, HostListener } from '@angular/core';

import { WindowRef } from '../../core/window-ref.service';

@Directive({
  selector: '[appSeamlessWithWindow]'
})
export class SeamlessWithWindowDirective {

  constructor(private el: ElementRef, private windowRef: WindowRef) {
    this.setIframeDimensions();
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.setIframeDimensions();
  }
  setIframeDimensions() {
    this.el.nativeElement.style.width = this.windowRef.nativeWindow.innerWidth + 'px';
    this.el.nativeElement.style.position = 'fixed';
    this.el.nativeElement.style.height = this.windowRef.nativeWindow.innerHeight - 73 + 'px';
    this.el.nativeElement.style.left = 0;
  }
}
