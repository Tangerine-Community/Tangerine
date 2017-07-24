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

  countdownMode = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.countdown = this.duration;
  }

  clickedStart() {
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
    console.log('time is up');
  }

}
