import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-create-case-definition',
  templateUrl: './create-case-definition.component.html',
  styleUrls: ['./create-case-definition.component.css']
})
export class CreateCaseDefinitionComponent implements OnInit {
  groupId;
  caseName = '';
  constructor(private route: ActivatedRoute,
    router: Router,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
  }

  async create() {
    const id = `${this.groupsService.normalizeInput(this.caseName)}-${this.groupsService.generateID(6)}`;
    const src = `./${id}.json`;
    const caseDefinitionFilePath = './case-definitions.json';
    const caseObject = { id, name: this.caseName };
    const caseDefinitionsPayload = { ...caseObject, src };
    const caseDefinitions = await this.groupsService.getCaseDefinitions(this.groupId) || [];
    try {
      await this.groupsService.saveFileToGroupDirectory(this.groupId, [...caseDefinitions, caseDefinitionsPayload], caseDefinitionFilePath);
      // create definition file
      await this.groupsService.saveFileToGroupDirectory(this.groupId, { ...caseObject, eventDefinitions: [], revision: '' }, src);
      this.errorHandler.handleError(_TRANSLATE('Case Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Save Case.'));
    }
  }

}
