import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-group-releases',
  templateUrl: './group-releases.component.html',
  styleUrls: ['./group-releases.component.css']
})
export class GroupReleasesComponent implements OnInit {

  title = _TRANSLATE('Releases')
  breadcrumbs:Array<Breadcrumb> = []
 
  @Input() groupId:string
  T_ARCHIVE_APKS_TO_DISK;;
  T_ARCHIVE_PWAS_TO_DISK;;
  constructor(private httpClient: HttpClient, private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Releases'),
        url: 'releases'
      }
    ]

    try {
      const result: any = await this.httpClient.get('/configuration/archiveToDisk').toPromise();
      if(result.T_ARCHIVE_APKS_TO_DISK && result.T_ARCHIVE_APKS_TO_DISK==="true"){
        this.T_ARCHIVE_APKS_TO_DISK = true;
      }
      if(result.T_ARCHIVE_PWAS_TO_DISK && result.T_ARCHIVE_PWAS_TO_DISK==="true"){
        this.T_ARCHIVE_PWAS_TO_DISK = true;
      } 
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

}
