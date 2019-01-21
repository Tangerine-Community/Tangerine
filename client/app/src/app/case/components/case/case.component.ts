import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements OnInit, AfterContentInit {
  caseService:CaseService;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }
  async ngOnInit() {
  }
  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      const caseService = new CaseService()
      await caseService.load(params.id)
      this.caseService = caseService
    })
  }

  async startEvent(eventDefinitionId) {
    const caseEvent = await this.caseService.startEvent(eventDefinitionId)
    this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

}
