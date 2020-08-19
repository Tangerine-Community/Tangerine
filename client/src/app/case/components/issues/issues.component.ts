import { AppContext } from 'src/app/app-context.enum';
import { UserService } from 'src/app/shared/_services/user.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Issue } from '../../classes/issue.class';
import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from 'constants';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {

  issues:Array<Issue>
  loading = false

  constructor(
    private userService:UserService
  ) { }

  async ngOnInit(){
    this.onSearch()
  }

  async onSearch() {
    const userDb = await this.userService.getUserDatabase()
    this.issues = <Array<Issue>>(await userDb.query('byType', {key: 'issue', include_docs: true}))
      .rows
      .map(row => <Issue>row.doc)
      .filter(issue => issue.resolveOnAppContexts && issue.resolveOnAppContexts.includes(AppContext.Client))
  }

}
