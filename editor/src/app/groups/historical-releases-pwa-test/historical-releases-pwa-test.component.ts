import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-historical-releases-pwa-test',
  templateUrl: './historical-releases-pwa-test.component.html',
  styleUrls: ['./historical-releases-pwa-test.component.css']
})
export class HistoricalReleasesPwaTestComponent implements OnInit {

  displayedColumns = ['buildId', 'build', 'releaseType', 'date'];
  groupsData: [];

  constructor(private groupsService: GroupsService, private route: ActivatedRoute) { }

  async ngOnInit() {
    const result = await this.groupsService.getGroupInfo(this.route.snapshot.paramMap.get('groupId'));
    this.groupsData = result.releases.filter(e => e.releaseType === 'qa' && e.build === 'PWA');
  }
}
