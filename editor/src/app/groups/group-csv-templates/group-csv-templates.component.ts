import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CsvTemplate, TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-group-csv-templates',
  templateUrl: './group-csv-templates.component.html',
  styleUrls: ['./group-csv-templates.component.css']
})
export class GroupCsvTemplatesComponent implements OnInit {

  csvTemplates:Array<CsvTemplate> = []
  groupId:string

  constructor(
    private formsService: TangerineFormsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId']
      this.listCsvTemplates()
    })
  }

  async listCsvTemplates() {
    this.csvTemplates = await this.formsService.listCsvTemplates(this.groupId)
  }

  async createCsvTemplate() {
    const csvTemplate = await this.formsService.createCsvTemplate(this.groupId)
    this.router.navigate([csvTemplate._id], {relativeTo: this.route})
  }

  async onRowEdit($event) {
    this.router.navigate([$event._id], {relativeTo: this.route})
  }

  async onRowDelete($event) {
    const status = await this.formsService.deleteCsvTemplate(this.groupId, $event._id)
    this.listCsvTemplates()
  }

}
