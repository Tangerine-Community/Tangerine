import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { GroupsService } from '../services/groups.service';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';

@Component({
  selector: 'app-release-apk',
  templateUrl: './release-apk.component.html',
  styleUrls: ['./release-apk.component.css']
})
export class ReleaseApkComponent implements OnInit {

  buildApkIsComplete = false;
  groupName = '';
  releaseType = '';
  errorGeneratingAPK;

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params['id'];
      this.releaseType = params['releaseType'];
    });
    await this.releaseAPK();
  }

  async releaseAPK() {
    try {
      const result: any = await this.groupsService.releaseAPK(this.groupName, this.releaseType);
      this.buildApkIsComplete = result.statusCode === 200;
    } catch (error) {
      this.errorGeneratingAPK = true;
      this.buildApkIsComplete = false;
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Generate APK'));
    }
  }

}
