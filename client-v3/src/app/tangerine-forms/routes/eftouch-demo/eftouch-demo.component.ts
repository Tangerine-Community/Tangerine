import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eftouch-demo',
  templateUrl: './eftouch-demo.component.html',
  styleUrls: ['./eftouch-demo.component.css']
})
export class EftouchDemoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  show(show, hide) {
    console.log("showing: " + show)
    // #slide2
    document.querySelector(show).style.display = "block";
    document.querySelector(hide).style.display = "none";
  }

}
