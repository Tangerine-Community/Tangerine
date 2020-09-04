import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { UserService } from './../../../shared/_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { AppContext } from 'src/app/app-context.enum';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {

  @ViewChild('container', { static: true }) container:ElementRef

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private caseService: CaseService,
    private userService:UserService
  ) { }

  ngOnInit() {
    this.container.nativeElement.innerHTML = `
      <tangy-form id="form" #form>
        <tangy-form-item id="new-issue" title="New Issue">
          <tangy-input name="title" label="Title" inner-label=" "></tangy-input>
          <tangy-input name="description" label="Description" inner-label=" "></tangy-input>
        </tangy-form-item>
      </tangy-form>
    `
    this.route.params.subscribe(async params => {
      const caseId = params.caseId
      const eventId = params.eventId
      const eventFormId = params.eventFormId
      const userName = await this.userService.getCurrentUser()
      const userId = userName
      const groupId = window.location.pathname.split('/')[2]
      this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
        event.preventDefault()
        const response = new TangyFormResponseModel(event.target.response)
        const title = response.inputsByName.title.value
        const description = response.inputsByName.description.value
        const issue = await this.caseService.createIssue(title, description, caseId, eventId, eventFormId, userId, userName, [AppContext.Editor, AppContext.Client])
        this.router.navigate(['issue', issue._id])
        



      })


    })

  }

}
