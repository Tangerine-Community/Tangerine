import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tangerine-form-timed',
  templateUrl: './tangerine-form-timed.component.html',
  styleUrls: ['./tangerine-form-timed.component.css']
})
export class TangerineFormTimedComponent implements OnInit {

  @Input() duration = 60;
  @Input() id = 'timed';

  countdown = 0;
  timer: any;
  lastSelectedId = '';

  selectLastInputMode = false;
  countdownMode = false;

  statusMessage = 'Click start timer to begin.';

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    // Set our countdown to the desired duration.
    this.countdown = this.duration;
    // Watch all input elements for a click. This will be used for setting the lastInput hidden variable.
    const inputElements = this.elementRef.nativeElement.querySelectorAll('input');
    inputElements.forEach(element => {
      element.addEventListener('click', (event) => {
        // Only do something when we are selecting the last input.
        if (this.selectLastInputMode === true) {
          // Cleanup any previously selected last input.
          inputElements.forEach(cleanupElement => {
            if (cleanupElement.labels && cleanupElement.labels.length > 0) {
              const cleanupLabelEl = cleanupElement.labels[0];
              cleanupLabelEl.setAttribute('style', ''); ;
            }
          });
          // That last click will cause the opposite of what we want. Put it back to the original state.
          event.srcElement.checked = !event.srcElement.checked;
          // Style the label.
          const labelEl = event.srcElement.labels[0];
          // Angular styles don't work on native elements.
          labelEl.className = 'lastInput';
          // ... but inline styles do.
          labelEl.setAttribute('style', 'color:red; border: 1px solid blue;'); ;
          this.statusMessage = 'You may now proceed.';
          // Set the last selected hidden variable.
          debugger;
          // Will set the value of the id of lastSelectedInputEl for good measure but it's not useful because it's too slow.
          this.lastSelectedId = event.srcElement.id;
          const lastSelectedInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_last_selected');
          // If we don't set this directly, there is a race condition where setting this.lastSelectedId doesn't make into the DOM in time.
          lastSelectedInputEl.value = event.srcElement.id;
          lastSelectedInputEl.dispatchEvent(new Event('change', {bubbles: true}));

        }
      });
    });
  }

  clickedReset() {
    this.countdown = this.duration;
  }

  clickedStart() {
    this.statusMessage = '';
    if (this.countdownMode === false) {
      this.countdownMode = true;
      const countdownInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_countdown');
      console.log('starting timer');
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
          countdownInputEl.dispatchEvent(new Event('change', {bubbles: true}));
        } else {
          clearInterval(this.timer);
          countdownInputEl.dispatchEvent(new Event('change', {bubbles: true}));
          this.timeIsUp();
        }
      }, 1000);
    }
  }

  clickedStop() {
    clearInterval(this.timer);
    this.countdownMode = false;
  }

  timeIsUp() {
    this.statusMessage = 'Time is up, click the last item covered.';
    this.countdownMode = false;
    this.selectLastInputMode = true;
  }

}
