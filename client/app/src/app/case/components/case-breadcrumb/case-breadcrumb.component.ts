import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../../services/case.service'

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
          label: `Case ${this.caseId.substr(0,6)}`,
          icon: 'folder'
        }
      ]
    }
    if (this.caseEventId) {
      this.crumbs.push(<Crumb>{
        url: `/case/event/${this.caseId}/${this.caseEventId}`,
        label: `Event ${this.caseEventId.substr(0,6)}`,
        icon: 'event'
      })
    }
    if (this.eventFormId) {
      this.crumbs.push(<Crumb>{
        url: `/case/event/form/${this.caseId}/${this.caseEventId}/${this.eventFormId}`,
        label: `Form ${this.eventFormId.substr(0,6)}`,
        icon: 'assignment'
      })
    }
  }

}
