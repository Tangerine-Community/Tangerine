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

  groupId = '';
  releaseType = '';
  releaseNotes = '';
  versionTag = '';
  step = '';
  code = {
    STATUS_BUILDING: 'STATUS_BUILDING',
    STATUS_ERROR: 'STATUS_ERROR',
    STATUS_DONE: 'STATUS_DONE',
    STATUS_WAIT: 'STATUS_WAIT'
  }
  status: any

  constructor(
    private groupsService: GroupsService
  ) { }

  async ngOnInit() {
  }

  async releaseAPK() {
    this.status = this.code.STATUS_WAIT
    try {
      const result: any = await this.groupsService.releaseAPK(this.groupId, this.releaseType, this.versionTag, this.releaseNotes);
      // Wait 5 seconds so the process can start. This can result in false positives. Would be better to have build IDs returns from the release command.
      await sleep(5000)
      let statusMessage = {}
      let processing = true;
      while (processing === true) {
        statusMessage = await this.groupsService.apkIsBuilding(this.groupId, this.releaseType)
        if (typeof statusMessage !== 'undefined') {
          processing = statusMessage['processing']
          this.step = statusMessage['step']
        }
        this.status = this.code.STATUS_BUILDING
        await sleep(10000)
      }
      this.status = this.code.STATUS_DONE;
      this.step = null;
    } catch (error) {
      this.status = this.code.STATUS_ERROR;
      console.error(error);
    }
  }

}
