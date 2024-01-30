import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  appConfig = window['appConfig']
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
  $afterSubmit = new Subject()

  async ngOnInit() {
    this.formPlayer.formId = "about";
    this.formPlayer.$beforeSubmit.subscribe(() => { this.closeAbout() });
    this.formPlayer.render()
  }

  closeAbout() {
    window.location.href = this.appConfig.homeUrl
  }

}
