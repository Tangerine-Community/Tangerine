import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { WindowRef } from '../../../shared/_services/window-ref.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements OnInit, AfterContentInit {

  caseService:CaseService;
  @ViewChild('caseFormContainer') caseFormContainer: ElementRef;
  tangyFormEl:any
  ready = false
  show = 'manifest'

  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private router: Router
  ) { }

  async ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.caseService = new CaseService({ databaseName: localStorage.getItem('currentUser') });
      await this.caseService.load(params.id)
      this.windowRef.nativeWindow.caseService = this.caseService
      const tangyFormMarkup = await this.caseService.getFormMarkup(this.caseService.caseDefinition.formId)
      this.caseFormContainer.nativeElement.innerHTML = tangyFormMarkup
      this.tangyFormEl = this.caseFormContainer.nativeElement.querySelector('tangy-form') 
      if (!this.caseService.case.status) {
        this.tangyFormEl.querySelectorAll('tangy-form-item').forEach((item) => {
          this.caseService.case.items.push(item.getProps())
        })
        this.tangyFormEl.response = this.caseService.case
        this.caseService.case = {...this.caseService.case, ...this.tangyFormEl.response}
        this.caseService.case.form = this.tangyFormEl.getProps()
        this.tangyFormEl.querySelectorAll('tangy-form-item')[0].submit()
        this.caseService.case.items[0].inputs = this.tangyFormEl.querySelectorAll('tangy-form-item')[0].inputs
        this.caseService.case.status = 'CASE_STATUS_INITIALIZED'
        await this.caseService.save()
        if (this.caseService.caseDefinition.startFormOnOpen && this.caseService.caseDefinition.startFormOnOpen.eventFormId) {
          const caseEvent = this.caseService.startEvent(this.caseService.caseDefinition.startFormOnOpen.eventId)
          const eventForm = this.caseService.startEventForm(caseEvent.id, this.caseService.caseDefinition.startFormOnOpen.eventFormId) 
          await this.caseService.save()
          this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
          return
        }
      }
      this.tangyFormEl.response = this.caseService.case
      this.tangyFormEl.enableItemReadOnly()
      this.ready = true

    })
  }

  async startEvent(eventDefinitionId) {
    const caseEvent = this.caseService.startEvent(eventDefinitionId)
    await this.caseService.save()
    this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

}
