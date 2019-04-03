import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { WindowRef } from 'src/app/core/window-ref.service';

@Component({
  selector: 'app-release-pwa',
  templateUrl: './release-pwa.component.html',
  styleUrls: ['./release-pwa.component.css']
})
export class ReleasePwaComponent implements OnInit {

  buildPwaIsComplete = false;
  groupName = '';
  releaseType = '';
  errorGeneratingPWA;
  pwaUrl
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private windowRef: WindowRef 
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params['id'];
      this.releaseType = params['releaseType'];
    });
    await this.releasePWA();
  }

  async releasePWA() {
    try {
      const result: any = await this.groupsService.releasePWA(this.groupName, this.releaseType);
      this.pwaUrl = `${this.windowRef.nativeWindow.location.origin}/releases/${this.releaseType}/pwas/${this.groupName}`

      this.buildPwaIsComplete = result.statusCode === 200;
    } catch (error) {
      this.errorGeneratingPWA = true;
      this.buildPwaIsComplete = false;
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Generate PWA'));
    }
  }

}
