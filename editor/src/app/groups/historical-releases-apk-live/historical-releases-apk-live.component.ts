import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from 'src/app/core/window-ref.service';
import { BuildInfo } from '../build-info';
import { GroupsService } from '../services/groups.service';
import {_TRANSLATE} from "../../shared/_services/translation-marker";
import {Breadcrumb} from "../../shared/_components/breadcrumb/breadcrumb.component";
import * as qrcode from 'qrcode-generator-es6';

@Component({
  selector: 'app-historical-releases-apk-live',
  templateUrl: './historical-releases-apk-live.component.html',
  styleUrls: ['./historical-releases-apk-live.component.css']
})
export class HistoricalReleasesApkLiveComponent implements OnInit {
  title = _TRANSLATE('APK Live Archives')
  breadcrumbs:Array<Breadcrumb> = []
  displayedColumns = [ 'versionTag', 'build', 'releaseType', 'date', 'buildId', 'tangerineVersion', 'releaseNotes', 'qrCode'];
  groupsData;
  groupId;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private groupsService: GroupsService, private route: ActivatedRoute, private windowRef: WindowRef) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Releases'),
        url: 'releases'
      },
      <Breadcrumb>{
        label: _TRANSLATE('APK Live Archives'),
        url: 'releases/historical-releases-apk-live'
      }
    ]
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    const result = await this.groupsService.getGroupInfo(this.groupId);
    this.groupsData = new MatTableDataSource<BuildInfo>(result.releases.
      filter(e => e.releaseType === 'prod' && e.build === 'APK').map( e => ({...e, dateString: new Date(e.date)})).sort((a, b) => b.date - a.date));
    this.groupsData.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.groupsData.filter = filterValue.trim().toLowerCase();
  }

  getReleaseCode(data) {
    if (data) {
      const url = `${this.windowRef.nativeWindow.location.origin}/releases/prod/apks/archive/${this.groupId}/${this.groupId}-${data}.apk`
      const qr = new qrcode.default(0, 'H')
      qr.addData(`${url}`)
      qr.make()
      window['dialog'].innerHTML = `<div style="width:${Math.round((window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) *.6)}px" id="qr"></div>`
      window['dialog'].open()
      window['dialog'].querySelector('#qr').innerHTML = qr.createSvgTag({cellSize:500, margin:0,cellColor:(c, r) =>''})
    }
  }

}
