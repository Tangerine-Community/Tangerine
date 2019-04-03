import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../../services/case.service'
import { t } from 'tangy-form/util/t.js'

class Crumb {
  url:string
  label:string
}

@Component({
  selector: 'app-case-breadcrumb',
  templateUrl: './case-breadcrumb.component.html',
  styleUrls: ['./case-breadcrumb.component.css']
})
export class CaseBreadcrumbComponent implements OnInit {

  @Input() caseId:string
  @Input() caseEventId:string
  @Input() eventFormId:string
  crumbs:Array<Crumb> = []

  constructor() { }

  ngOnInit() {
    if (this.caseId) {
      
      this.crumbs = [
        ...this.crumbs,
        <Crumb>{
          url: `/case/${this.caseId}`,
          label: `${t('Case')} ${this.caseId.substr(0,6)}`,
          icon: 'folder'
        }
      ]
    }
    if (this.caseEventId) {
      this.crumbs.push(<Crumb>{
        url: `/case/event/${this.caseId}/${this.caseEventId}`,
        label: `${t('Event')} ${this.caseEventId.substr(0,6)}`,
        icon: 'event'
      })
    }
    if (this.eventFormId) {
      this.crumbs.push(<Crumb>{
        url: `/case/event/form/${this.caseId}/${this.caseEventId}/${this.eventFormId}`,
        label: `${t('Form')} ${this.eventFormId.substr(0,6)}`,
        icon: 'assignment'
      })
    }
  }

}
