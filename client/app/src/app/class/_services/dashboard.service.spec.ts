import { TestBed, inject } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService]
    });
  });

  it('should be created', inject([DashboardService], (service: DashboardService) => {
    expect(service).toBeTruthy();
  }));
  it('should transform results', inject([DashboardService], async (service: DashboardService) => {
    let curriculumId = "form-0.14408564179243433"
    let tangyFormItem = {
      "id": "item_246237e7e580447c924eed6d6e5fa1ba",
      "title": "Lesson 1 Letters",
      "on-open": "",
      "on-change": "",
      "category": "",
      "tagName": "TANGY-FORM-ITEM",
      "constructorName": "HTMLElement",
      "children": [
        {
          "required": "true",
          "columns": "4",
          "duration": "10",
          "name": "frumpkin",
          "score-target": "10",
          "score-baseline": "",
          "score-spread": "2",
          "mode": "TANGY_TIMED_MODE_UNTOUCHED",
          "incomplete": "",
          "start-time": "0",
          "end-time": "0",
          "time-remaining": "60",
          "tagName": "TANGY-TIMED",
          "constructorName": "HTMLElement"
        }
      ]
    }
    let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    let curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    let result = await this.http.get(`./test-grouping-report.json`, {responseType: 'json'}).toPromise();
    const data = await this.transformResultSet(result.rows, curriculumFormsList, tangyFormItem);
    expect(data.length).toBe(5);
    debugger;

    // expect(service).toBeTruthy();
  }));
});
