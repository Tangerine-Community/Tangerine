import { Issue } from '../../classes/issue.class';
import { Router, ActivatedRoute } from '@angular/router';
import { CasesService } from './../../services/cases.service';
import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {

  issue:Issue
  ready = false

  constructor(
    private caseService:CaseService,
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      window['caseService'] = this.caseService
      this.issue = await this.caseService.getIssue(params.issueId)
      await this.caseService.load(this.issue.caseId)
      this.ready = true
    })
  }

}
