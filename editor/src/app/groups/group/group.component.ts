import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  id: string;
  private sub: any;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.id = params['id'];

       // In a real app: dispatch action to load the details here.
    });
  }

  ngAfterContentInit() {
    const container = document.createElement('div');
    this.elementRef.nativeElement.appendChild(container);
    container.innerHTML = `<iframe src="/editor/${this.id}/tangy-forms/editor.html"></iframe>`;
    const iframe = container.querySelector('iframe')
    // @TODO Could use better iframe resizing and removal of event binding.
    //this.screenResizer = setInterval(() => iframe.style.setProperty('height', window.innerHeight - 60))
    setInterval(() => iframe.style.setProperty('height', '2000px'), 500)
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
