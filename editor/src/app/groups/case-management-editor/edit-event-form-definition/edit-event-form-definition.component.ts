import { TangerineFormsService } from './../../services/tangerine-forms.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { Subscription } from 'rxjs';
import { CaseManagementEditorService } from '../case-management-editor.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-edit-event-form-definition',
  templateUrl: './edit-event-form-definition.component.html',
  styleUrls: ['./edit-event-form-definition.component.css']
})
export class EditEventFormDefinitionComponent implements OnInit, OnDestroy {
  groupId;
  formsList;
  formInActive = true;
  eventFormDefinition = {
    id: '',
    formId: '',
    name: '',
    repeatable: undefined,
    required: undefined
  };
  subscription: Subscription;
  caseDetailId;
  caseStructure;
  eventDefinitionId;
  eventFormDefinitionId;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private caseService: CaseManagementEditorService,
    private tangerineFormsService:TangerineFormsService,
    private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
    this.formsList = (await this.tangerineFormsService.getFormsInfo(this.groupId)).filter(x => x['type'] === 'form');
    this.subscription = this.route.queryParams.subscribe(async queryParams => {
      this.caseDetailId = queryParams['caseDetailId'];
      this.eventDefinitionId = queryParams['parentId'];
      this.eventFormDefinitionId = queryParams['id'];
      this.caseStructure = await this.groupsService.getCaseStructure(this.groupId, this.caseDetailId);
      const parentIndex = this.caseStructure.eventDefinitions.findIndex(e => e.id === this.eventDefinitionId);
      const formDefinitions = this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions;
      const index = formDefinitions.findIndex(e => e.id === this.eventFormDefinitionId);
      this.eventFormDefinition = formDefinitions[index];
    });


  }

  async editEventFormDefinition() {
    try {
      const eventDefinitions = this.caseStructure.eventDefinitions;
      const parentIndex = eventDefinitions.findIndex(e => e.id === this.eventDefinitionId);
      const formDefinitions = eventDefinitions[parentIndex].eventFormDefinitions;
      const index = formDefinitions.findIndex(e => e.id === this.eventFormDefinitionId);
      this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions[index] = this.eventFormDefinition;
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `${this.caseDetailId}.json`);
      this.caseService.sendMessage('reloadTree');
      this.errorHandler.handleError(_TRANSLATE('Event Form Definition Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Form Definition not Saved.'));
    }
  }
  async deleteEventFormDefinition() {
    try {
      const shouldDelete = confirm(`Delete Event Form Definition: ${this.eventFormDefinition.name}?`);
      if (shouldDelete) {
        const eventDefinitions = this.caseStructure.eventDefinitions;
        const parentIndex = eventDefinitions.findIndex(e => e.id === this.eventDefinitionId);
        this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions =
          this.caseStructure.eventDefinitions[parentIndex].eventFormDefinitions.filter(e => e.id !== this.eventFormDefinitionId);
        await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `${this.caseDetailId}.json`);
        this.caseService.sendMessage('reloadTree');
        this.errorHandler.handleError(_TRANSLATE('Event Form Definition Deleted Successfully.'));
        this.router.navigate([], { replaceUrl: true, queryParams: { caseDetailId: this.caseDetailId, id: this.eventDefinitionId } });
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Form Definition not Saved.'));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
