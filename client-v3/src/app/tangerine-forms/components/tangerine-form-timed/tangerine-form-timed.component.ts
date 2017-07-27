import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tangerine-form-timed',
  templateUrl: './tangerine-form-timed.component.html',
  styleUrls: ['./tangerine-form-timed.component.css']
})
export class TangerineFormTimedComponent implements OnInit {

  // In seconds.
  @Input() duration = 60;
  // An ID that will be
  @Input() id = 'timed';

  // A place to stash the timer when it needs to stop.
  private timer: any;
  // Track the timer.
  private timeSpent = 0;
  private timeRemaining = 0;
  // Allows our event listeners on input clicks to know if we are marking the last item.
  // @TODO Probably a better name like "lastItemCovered".
  private lastSelectedMode = false;
  // A message to display to the user about the state of the form.
  statusMessage = 'Click "start timer" to begin.';
  // A place to put all of the input elements in this form.
  inputElements: any;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    // Set our countdown to the desired duration.
    this.timeRemaining = this.duration;
    // Find all our input elements.
    this.inputElements = Array.prototype.slice.call(this.elementRef.nativeElement.querySelectorAll('input'));
    // Disable all the input elements. Will enable on start.
    this.inputElements.forEach(element => element.disabled = true);
    this.inputElements.forEach(element => {
      element.addEventListener('click', (event) => {
        if (this.lastSelectedMode === true) {
          this.removeLastSelected();
          // That last click will cause the opposite of what we want. Put it back to the original state.
          event.srcElement.checked = !event.srcElement.checked;
          // Style the label.
          const labelEl = event.srcElement.labels[0];
          // @TODO: This won't work because Angular styles don't work on native elements. Really?
          labelEl.className = 'lastInput';
          // ... but inline styles do.
          labelEl.setAttribute('style', 'color:red; border: 1px solid blue;'); ;
          this.statusMessage = 'You may now proceed.';
          // Set hidden variables.
          // Last selected id.
          const lastSelectedIdInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_last_selected_id');
          lastSelectedIdInputEl.value = event.srcElement.id;
          lastSelectedIdInputEl.dispatchEvent(new Event('change', {bubbles: true}));
          // Last selected nth item.
          const lastSelectedNthInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_last_selected_nth');
          lastSelectedNthInputEl.value = this.inputElements.findIndex((el) => el.id === event.srcElement.id) + 1;
          lastSelectedNthInputEl.dispatchEvent(new Event('change', {bubbles: true}));
          // items per minute
          const itemsPerMinuteInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_items_per_minute');
          itemsPerMinuteInputEl.value = ( lastSelectedNthInputEl.value / ( this.timeSpent / 60 ) );
          itemsPerMinuteInputEl.dispatchEvent(new Event('change', {bubbles: true}));
          // Items marked is number of checkboxes checked.
          const itemsNumberOfItemsMarkedInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_number_of_items_marked');
          itemsNumberOfItemsMarkedInputEl.value = this.inputElements.filter((element) => {
            return element.type === 'checkbox' && element.checked === true;
          }).length;
          itemsNumberOfItemsMarkedInputEl.dispatchEvent(new Event('change', {bubbles: true}));
        }
      });
    });
  }

  clickedReset() {
    this.removeLastSelected();
    this.lastSelectedMode = false;
    this.timeRemaining = this.duration;
    this.timeSpent = 0;
    if (this.timer.state === 'notScheduled') {
      this.statusMessage = 'You may click start to begin again.';
    }
  }

  clickedStart() {
    // Prevent double starts.
    if (this.timeSpent === 0) {
      const timeSpentInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_time_spent');
      const timeRemainingInputEl = this.elementRef.nativeElement.querySelector('#' + this.id + '_time_remaining');
      this.statusMessage = 'Timer is running.';
      this.inputElements.forEach((element) => element.disabled = false);
      this.timer = setInterval(() => {
        this.timeRemaining--;
        this.timeSpent++;
        if (this.timeRemaining === 0) {
          clearInterval(this.timer);
          this.timeIsUp();
        }
        timeRemainingInputEl.value = this.timeRemaining;
        timeRemainingInputEl.dispatchEvent(new Event('change', {bubbles: true}));
        timeSpentInputEl.value = this.timeSpent;
        timeSpentInputEl.dispatchEvent(new Event('change', {bubbles: true}));
      }, 1000);
    }
  }

  clickedPause() {
    // @TODO: Do we need pause/resume?
  }

  clickedStop() {
    clearInterval(this.timer);
    // @TODO Last item covered should be a feature you opt into. Not relevant to all things timed.
    // @TODO Disabling prevent last item from being selected.
    // this.inputElements.forEach(element => element.disabled = true);
    this.statusMessage = 'Click the last item covered.';
    this.lastSelectedMode = true;
  }

  timeIsUp() {
    clearInterval(this.timer);
    this.lastSelectedMode = true;
    this.statusMessage = 'Time is up, click the last item covered.';
  }

  removeLastSelected() {
    this.inputElements.forEach(cleanupElement => {
      if (cleanupElement.labels && cleanupElement.labels.length > 0) {
        const cleanupLabelEl = cleanupElement.labels[0];
        cleanupLabelEl.setAttribute('style', ''); ;
      }
    });
  }

}
