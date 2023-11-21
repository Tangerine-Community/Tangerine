import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

@Directive({
  selector: '[appProgressBarColor]'
})

/**
 * https://stackoverflow.com/a/60419480
 */
export class ProgressBarColor implements OnChanges{
  static counter = 0;
  color: string;
  @Input() appProgressBarColor;
  styleEl:HTMLStyleElement = document.createElement('style');

  //generate unique attribule which we will use to minimise the scope of our dynamic 
  style
  uniqueAttr = `app-progress-bar-color-${ProgressBarColor.counter++}`;

  constructor(private el: ElementRef) {
    const nativeEl: HTMLElement = this.el.nativeElement;
    nativeEl.setAttribute(this.uniqueAttr,'');
    nativeEl.appendChild(this.styleEl);
  }

  ngOnChanges(changes: SimpleChanges): void{
    this.updateColor();
  }


  updateColor(): void{
    if (this.appProgressBarColor > 75){
      this.appProgressBarColor = 'green'
    }
    else if (this.appProgressBarColor > 50){
      this.appProgressBarColor = 'gold'
    }
    else if (this.appProgressBarColor > 25){
      this.appProgressBarColor = 'orange'
    }
    else{
      this.appProgressBarColor = 'red'
    }
    // console.log(this.appProgressBarColor)

    // update dynamic style with the uniqueAttr
    this.styleEl.innerText = `
      [${this.uniqueAttr}] .mat-progress-bar-fill::after {
        background-color: ${this.appProgressBarColor};
      }
    `;
    // console.log(this.appProgressBarColor)
  }}