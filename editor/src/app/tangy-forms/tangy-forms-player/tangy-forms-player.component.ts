import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from '../../core/window-ref.service';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formUrl;
  constructor(private route: ActivatedRoute, private windowRef: WindowRef) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.formUrl = params['form'];
      console.log(this.formUrl);
      this.windowRef.nativeWindow.location = `../editor/yme/tangy-forms/editor.html#form=${this.formUrl}`;
    });
  }

}
