import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BuildInfo } from '../build-info';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-historical-releases-pwa-live',
  templateUrl: './historical-releases-pwa-live.component.html',
  styleUrls: ['./historical-releases-pwa-live.component.css']
})
export class HistoricalReleasesPwaLiveComponent implements OnInit {

  displayedColumns = ['buildId', 'build', 'releaseType', 'date', 'versionTag', 'releaseNotes'];
  groupsData;
  groupId;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private groupsService: GroupsService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    const result = await this.groupsService.getGroupInfo(this.groupId);
    this.groupsData = new MatTableDataSource<BuildInfo>(result.releases.
      filter(e => e.releaseType === 'prod' && e.build === 'PWA').map( e => ({...e, dateString: new Date(e.date)})));
    this.groupsData.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.groupsData.filter = filterValue.trim().toLowerCase();
  }

}
