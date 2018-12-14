import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

const STATUS_BUILDING = 'STATUS_BUILDING'
const STATUS_ERROR = 'STATUS_ERROR'
const STATUS_DONE = 'STATUS_DONE'
const STATUS_WAIT = 'STATUS_WAIT'

@Component({
  selector: 'app-release-apk',
  templateUrl: './release-apk.component.html',
  styleUrls: ['./release-apk.component.css']
})
export class ReleaseApkComponent implements OnInit {

  groupName = '';
  releaseType = '';
  code = {
    STATUS_BUILDING: 'STATUS_BUILDING',
    STATUS_ERROR: 'STATUS_ERROR',
    STATUS_DONE: 'STATUS_DONE',
    STATUS_WAIT: 'STATUS_WAIT'
  }
  status: any 

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
    this.status = this.code.STATUS_WAIT
    try {
      const result: any = await this.groupsService.releaseAPK(this.groupName, this.releaseType);
      // Wait 5 seconds so the process can start. This can result in false positives. Would be better to have build IDs returns from the release command.
      await sleep(5000)
      while (await this.groupsService.apkIsBuilding(this.groupName, this.releaseType)) {
        this.status = this.code.STATUS_BUILDING
        await sleep(10000)
      }
      this.status = this.code.STATUS_DONE;
    } catch (error) {
      this.status = this.code.STATUS_ERROR;
      console.error(error);
    }
  }

}
