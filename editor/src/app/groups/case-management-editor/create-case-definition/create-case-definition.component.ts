import { TangerineFormsService } from './../../services/tangerine-forms.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { CaseManagementEditorService } from '../case-management-editor.service';

@Component({
  selector: 'app-create-case-definition',
  templateUrl: './create-case-definition.component.html',
  styleUrls: ['./create-case-definition.component.css']
})
export class CreateCaseDefinitionComponent implements OnInit {
  groupId;
  caseName = '';
  constructor(
    private route: ActivatedRoute,
    router: Router,
    private groupsService: GroupsService,
    private caseService: CaseManagementEditorService,
    private tangerineFormsService:TangerineFormsService,
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

      const formId = `form-${id}`;
      const caseFormFileContents = `
      <tangy-form id="${formId}" title="${caseObject.name}">
        <tangy-form-item id="item_${this.groupsService.generateUUID()}" title="Item 1">
          <template>
            <p>Empty Case Form</p>
          </template>
        </tangy-form-item>
      </tangy-form>`;
      const caseFormFilePath = `./${formId}/form.html`;
      const formsJSON = await this.tangerineFormsService.getFormsInfo(this.groupId);
      const formEntry = {
        id: formId,
        title: caseObject.name,
        type: 'case',
        src: `./assets/${formId}/form.html`
      };
      // Create case form
      const stringifyFormContent = false;
      await this.groupsService.saveFileToGroupDirectory(this.groupId, caseFormFileContents, caseFormFilePath, stringifyFormContent);
      // add case form to forms.json
      await this.groupsService.saveFileToGroupDirectory(this.groupId, [...formsJSON, formEntry], `./forms.json`);

      this.caseService.sendMessage('reloadTree');
      this.errorHandler.handleError(_TRANSLATE('Case Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Save Case.'));
    }
  }

}
