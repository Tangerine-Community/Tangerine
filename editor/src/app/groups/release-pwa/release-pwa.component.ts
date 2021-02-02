import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
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

  @ViewChild('urlContainer', {static: true}) urlContainer: ElementRef;
  buildPwaIsComplete = false;
  copySuccess = false;
  groupId = '';
  releaseType = '';
  releaseNotes = '';
  versionTag = '';
  errorGeneratingPWA;
  pwaUrl;
  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private windowRef: WindowRef 
  ) { }

  async ngOnInit() {
  }

  async releasePWA() {
    try {
      const result: any = await this.groupsService.releasePWA(this.groupId, this.releaseType, this.versionTag, this.releaseNotes);
      this.pwaUrl = `${this.windowRef.nativeWindow.location.origin}/releases/${this.releaseType}/pwas/${this.groupId}`
      this.buildPwaIsComplete = result.statusCode === 200;
    } catch (error) {
      this.errorGeneratingPWA = true;
      this.buildPwaIsComplete = false;
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Release took too long. Please try again.'));
    }
  }

  copyUrl() {
    this.urlContainer.nativeElement.inputElement.inputElement.select()
    this.windowRef.nativeWindow.document.execCommand("copy");
    this.copySuccess = true
  }

}
