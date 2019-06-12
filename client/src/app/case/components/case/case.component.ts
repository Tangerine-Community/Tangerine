import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { WindowRef } from '../../../shared/_services/window-ref.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements AfterContentInit {

  tangyFormEl:any
  ready = false
  show = 'manifest'
  templateTitle = ''
  templateDescription = ''

  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private caseService: CaseService,
    private tangyFormService: TangyFormService,
    private router: Router
  ) { }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.id)
      const caseService = this.caseService
      eval(`this.templateTitle = caseService.caseDefinition.templateTitle ? \`${caseService.caseDefinition.templateTitle}\` : ''`)
      eval(`this.templateDescription = caseService.caseDefinition.templateDescription ? \`${caseService.caseDefinition.templateDescription}\` : ''`)
      this.windowRef.nativeWindow.caseService = this.caseService
      this.ready = true
    })
  }

  async createEvent(eventDefinitionId) {
    const caseEvent = this.caseService.createEvent(eventDefinitionId)
    await this.caseService.save()
    //this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

  async createEventAndOpen(eventDefinitionId) {
    const caseEvent = this.caseService.createEvent(eventDefinitionId)
    await this.caseService.save()
    this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

}
