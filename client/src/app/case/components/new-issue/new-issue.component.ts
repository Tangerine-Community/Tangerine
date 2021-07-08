import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { UserService } from './../../../shared/_services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { AppContext } from 'src/app/app-context.enum';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { DeviceService } from 'src/app/device/services/device.service';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {

  @ViewChild('container', { static: true }) container:ElementRef
  defaultTemplateIssueTitle = `Issue for \${caseDefinition.name}, by \${userName}`
  defaultTemplateIssueDescription = `` 

  renderedTemplateIssueTitle = ''
  renderedTemplateIssueDescription = ''

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private caseService: CaseService,
    private userService:UserService,
    private deviceService:DeviceService,
    private formService:TangyFormService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const device = await this.deviceService.getDevice()
      const caseId = params.caseId
      const eventId = params.eventId
      const eventFormId = params.eventFormId
      const userName = await this.userService.getCurrentUser()
      const userId = userName
      const groupId = window.location.pathname.split('/')[2]
      await this.caseService.load(caseId)
      const caseInstance = this.caseService.case
      const caseDefinition = this.caseService.caseDefinition
      const caseEvent = caseInstance.events.find(caseEvent => caseEvent.id === eventId)
      const caseEventDefinition = this.caseService.caseDefinition.eventDefinitions.find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
      const eventForm = caseEvent.eventForms.find(eventForm => eventForm.id === eventFormId)
      const eventFormDefinition = caseEventDefinition.eventFormDefinitions.find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
      const formResponse = await this.formService.getResponse(eventForm.formResponseId)
      eval(`this.renderedTemplateIssueTitle = this.caseService.caseDefinition.templateIssueTitle ? \`${this.caseService.caseDefinition.templateIssueTitle}\` : \`${this.defaultTemplateIssueTitle}\``)
      eval(`this.renderedTemplateIssueDescription = this.caseService.caseDefinition.templateIssueDescription ? \`${this.caseService.caseDefinition.templateIssueDescription}\` : \`${this.defaultTemplateIssueDescription}\``)
      if (window.location.hash.split('/').includes('use-templates')) {
        await this.saveIssueAndRedirect(this.renderedTemplateIssueTitle, this.renderedTemplateIssueDescription, caseId, eventId, eventFormId, userId, userName, device._id)
      } else {
        this.container.nativeElement.innerHTML = `
          <tangy-form id="form" #form>
            <tangy-form-item id="new-issue" title="New Issue">
              <tangy-input name="title" label="Title" inner-label=" " value="${this.renderedTemplateIssueTitle}"></tangy-input>
              <tangy-input name="description" label="Description" inner-label=" " value="${this.renderedTemplateIssueDescription}"></tangy-input>
            </tangy-form-item>
          </tangy-form>
        `
        this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
          event.preventDefault()
          const response = new TangyFormResponseModel(event.target.response)
          const title = response.inputsByName.title.value
          const description = response.inputsByName.description.value
          await this.saveIssueAndRedirect(title, description, caseId, eventId, eventFormId, userId, userName, device._id)
        })
      }
    })
  }

  async saveIssueAndRedirect(title, description, caseId, eventId, eventFormId, userId, userName, deviceId) {
    const issue = await this.caseService.createIssue(title, description, caseId, eventId, eventFormId, userId, userName, false, deviceId)
    this.router.navigate(['issue', issue._id, 'form-revision'])
  }

}
