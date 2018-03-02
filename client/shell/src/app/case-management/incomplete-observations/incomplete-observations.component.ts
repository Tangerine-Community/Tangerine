import { Component, OnInit } from '@angular/core';
import { CaseManagementService } from '../_services/case-management.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-incomplete-observations',
  templateUrl: './incomplete-observations.component.html',
  styleUrls: ['./incomplete-observations.component.css']
})
export class IncompleteObservationsComponent implements OnInit {
  observations;
  constructor(private caseManagementService: CaseManagementService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const locationId = params['locationId'];
      this.getObservations(locationId);
    });
  }
  async getObservations(locationId: string) {
    const result = await this.caseManagementService.getIncompleteResponsesByLocationId(locationId);
    const formList = await this.caseManagementService.getFormList();
    this.observations = result.map((observation) => {
      const index = formList.findIndex(c => c.id === observation.doc.form['id']);
      return {
        formTitle: formList[index]['title'],
        startDatetime: observation.doc.startDatetime,
        formIndex: index,
        _id: observation.doc._id,
      };
    });
  }
}
