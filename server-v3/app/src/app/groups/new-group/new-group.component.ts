import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    const container = document.createElement('div');
    this.elementRef.nativeElement.appendChild(container);
    container.innerHTML = `<iframe src="/editor/"></iframe>`;
    const iframe = container.querySelector('iframe')
    // @TODO Could use better iframe resizing and removal of event binding.
    //this.screenResizer = setInterval(() => iframe.style.setProperty('height', window.innerHeight - 60))
    setInterval(() => iframe.style.setProperty('height', '2000px'), 500)

  }

}
