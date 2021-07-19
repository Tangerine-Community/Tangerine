import { DeviceService } from './../../../device/services/device.service';
import { AppContext } from 'src/app/app-context.enum';
import { UserService } from 'src/app/shared/_services/user.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Issue } from '../../classes/issue.class';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {

  issues:Array<Issue>
  loading = false

  constructor(
    private userService:UserService,
    private deviceService:DeviceService
  ) { }

  async ngOnInit(){
    this.onSearch()
  }

  async onSearch() {
    const userDb = await this.userService.getUserDatabase()
    const device = await this.deviceService.getDevice()
    this.issues = <Array<Issue>>(await userDb.query('byType', {key: 'issue', include_docs: true}))
      .rows
      .map(row => <Issue>row.doc)
  }

}
