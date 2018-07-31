import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { GroupsService } from '../services/groups.service';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';

@Component({
  selector: 'app-release-dat',
  templateUrl: './release-dat.component.html',
  styleUrls: ['./release-dat.component.css']
})
export class ReleaseDatComponent implements OnInit {

  buildDatIsComplete = false;
  datArchiveUrl = '';
  groupName = '';
  releaseType = '';
  errorGeneratingDat;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params['id'];
      this.releaseType = params['releaseType'];
    });
    await this.releaseDat();
  }

  async releaseDat() {
    try {
      const result: any = await this.groupsService.releaseDat(this.groupName, this.releaseType);
      this.buildDatIsComplete = result.statusCode === 200;
      this.datArchiveUrl = result.datArchiveUrl
    } catch (error) {
      this.errorGeneratingDat = true;
      this.buildDatIsComplete = false;
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Generate Dat'));
    }
  }

}
