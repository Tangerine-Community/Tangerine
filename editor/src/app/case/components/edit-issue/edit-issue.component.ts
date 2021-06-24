import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/auth/_services/user.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model';
import { CaseService } from '../../services/case.service';

@Component({
  selector: 'app-edit-issue',
  templateUrl: './edit-issue.component.html',
  styleUrls: ['./edit-issue.component.css']
})
export class EditIssueComponent implements OnInit {

  @ViewChild('container', { static: true }) container:ElementRef

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private caseService: CaseService,
    private userService:UserService,
    private formService:TangyFormService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const issueId = params.issueId
      debugger
      const issue = await this.caseService.getIssue(issueId)
      const userName = await this.userService.getCurrentUser()
      const userId = userName
      const groupId = window.location.pathname.split('/')[2]
      const issueLabel = issue.label
      // Legacy: Look in first event's comment for description.
      const issueDescription = issue.description || issue.events[0].data.comment
      // @TODO Resume Send to..
      this.container.nativeElement.innerHTML = `
        <tangy-form id="form" #form>
          <tangy-form-item id="new-issue" title="New Issue">
            <tangy-input name="title" label="Title" inner-label=" " value="${issueLabel}" required></tangy-input>
            <tangy-input name="description" label="Description" inner-label=" " value="${issueDescription}"></tangy-input>
            <tangy-radio-buttons name="send_to" label="Send to...">
              <option value="all_devices">All devices</option>
              <option value="device_by_id">Device by ID</option>
            </tangy-radio-buttons>
            <tangy-input name="device_id" label="Device ID" inner-label=" " show-if="getValue('send_to') === 'device_by_id'"></tangy-input>
          </tangy-form-item>
        </tangy-form>
      `
      this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
        event.preventDefault()
        const response = new TangyFormResponseModel(event.target.response)
        const issueLabel = response.inputsByName.title.value
        const issueDescription = response.inputsByName.description.value
        const sendToAllDevices = response.inputsByName.send_to.value.find(option => option.name === 'all_devices').value === 'on'
          ? true 
          : false
        const sendToDeviceById = response.inputsByName.device_id.value
        const issue = await this.caseService.updateIssueMeta(issueId, issueLabel, issueDescription, sendToAllDevices, sendToDeviceById, userName, userId)
        this.router.navigate(['groups', groupId, 'data', 'issues', issue._id])
      })
    })
  }

}
